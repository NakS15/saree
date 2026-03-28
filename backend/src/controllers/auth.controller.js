const crypto   = require('crypto');
const jwt      = require('jsonwebtoken');
const User     = require('../models/User.model');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail     = require('../utils/sendEmail');
const logger        = require('../config/logger');

// ─── Helpers ──────────────────────────────────────────────────────────────────
const signAccess   = (id) => jwt.sign({ id }, process.env.JWT_SECRET,         { expiresIn: process.env.JWT_EXPIRE });
const signRefresh  = (id) => jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRE });

const sendTokens = async (user, statusCode, res) => {
  const accessToken  = signAccess(user._id);
  const refreshToken = signRefresh(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const cookieOpts = {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge:   parseInt(process.env.COOKIE_EXPIRE_DAYS) * 24 * 60 * 60 * 1000,
  };

  res
    .status(statusCode)
    .cookie('refreshToken', refreshToken, cookieOpts)
    .json({
      success: true,
      accessToken,
      user: {
        _id:             user._id,
        name:            user.name,
        email:           user.email,
        phone:           user.phone,
        role:            user.role,
        avatar:          user.avatar,
        isEmailVerified: user.isEmailVerified,
      },
    });
};

// ─── Register ─────────────────────────────────────────────────────────────────
exports.register = async (req, res, next) => {
  const { name, email, password, phone, role } = req.body;

  const existing = await User.findOne({ email });
  if (existing) return next(new ErrorResponse('Email already registered', 400));

  const user  = await User.create({ name, email, password, phone, role: role === 'vendor' ? 'vendor' : 'customer' });
  const token = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;
  await sendEmail({ to: email, template: 'emailVerification', data: { name, verifyUrl } });

  await sendTokens(user, 201, res);
};

// ─── Login ────────────────────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password)))
    return next(new ErrorResponse('Invalid email or password', 401));

  if (!user.isActive) return next(new ErrorResponse('Account has been suspended. Contact support.', 403));

  await sendTokens(user, 200, res);
};

// ─── Logout ───────────────────────────────────────────────────────────────────
exports.logout = async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { refreshToken: null });
  res.clearCookie('refreshToken').status(200).json({ success: true, message: 'Logged out' });
};

// ─── Refresh Token ────────────────────────────────────────────────────────────
exports.refreshToken = async (req, res, next) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  if (!token) return next(new ErrorResponse('No refresh token', 401));

  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  const user    = await User.findOne({ _id: decoded.id, refreshToken: token });
  if (!user) return next(new ErrorResponse('Invalid refresh token', 401));

  const accessToken = signAccess(user._id);
  res.status(200).json({ success: true, accessToken });
};

// ─── Verify Email ─────────────────────────────────────────────────────────────
exports.verifyEmail = async (req, res, next) => {
  const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user   = await User.findOne({ emailVerificationToken: hashed, emailVerificationExpire: { $gt: Date.now() } });
  if (!user) return next(new ErrorResponse('Invalid or expired verification link', 400));

  user.isEmailVerified       = true;
  user.emailVerificationToken   = undefined;
  user.emailVerificationExpire  = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, message: 'Email verified successfully' });
};

// ─── Send Phone OTP ───────────────────────────────────────────────────────────
exports.sendPhoneOTP = async (req, res, next) => {
  const { phone } = req.body;
  if (!phone) return next(new ErrorResponse('Phone number required', 400));

  const otp     = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = Date.now() + 10 * 60 * 1000; // 10 min

  let user = await User.findOne({ phone });
  if (!user) {
    user = await User.create({ phone, name: 'User', password: crypto.randomBytes(20).toString('hex'), phoneOTP: otp, phoneOTPExpire: expires });
  } else {
    user.phoneOTP = otp; user.phoneOTPExpire = expires;
    await user.save({ validateBeforeSave: false });
  }

  if (process.env.NODE_ENV === 'development') {
    logger.info(`OTP for ${phone}: ${otp}`);
    return res.status(200).json({ success: true, message: 'OTP sent', devOTP: otp });
  }

  const sendSMS = require('../utils/sendSMS');
  await sendSMS({ to: phone, message: `Your SareeBazaar OTP is ${otp}. Valid for 10 minutes. Do not share.` });
  res.status(200).json({ success: true, message: 'OTP sent' });
};

// ─── Verify OTP ───────────────────────────────────────────────────────────────
exports.verifyOTP = async (req, res, next) => {
  const { phone, otp } = req.body;
  const user = await User.findOne({ phone, phoneOTP: otp, phoneOTPExpire: { $gt: Date.now() } });
  if (!user) return next(new ErrorResponse('Invalid or expired OTP', 400));

  user.isPhoneVerified = true; user.phoneOTP = undefined; user.phoneOTPExpire = undefined;
  await user.save({ validateBeforeSave: false });
  await sendTokens(user, 200, res);
};

// ─── Forgot Password ──────────────────────────────────────────────────────────
exports.forgotPassword = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(200).json({ success: true, message: 'If that email exists, a reset link has been sent.' });

  const token    = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
  await sendEmail({ to: user.email, template: 'passwordReset', data: { name: user.name, resetUrl } });

  res.status(200).json({ success: true, message: 'Password reset email sent' });
};

// ─── Reset Password ───────────────────────────────────────────────────────────
exports.resetPassword = async (req, res, next) => {
  const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user   = await User.findOne({ passwordResetToken: hashed, passwordResetExpire: { $gt: Date.now() } });
  if (!user) return next(new ErrorResponse('Invalid or expired reset token', 400));

  user.password            = req.body.password;
  user.passwordResetToken  = undefined;
  user.passwordResetExpire = undefined;
  await user.save();

  await sendTokens(user, 200, res);
};

// ─── Get Me ───────────────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id).select('-password -refreshToken');
  res.status(200).json({ success: true, data: user });
};
