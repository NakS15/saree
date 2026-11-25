const crypto   = require('crypto');
const jwt      = require('jsonwebtoken');
const User     = require('../models/User.model');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail     = require('../utils/sendEmail');
const logger        = require('../config/logger');
const { generateOTP, hashOTP, otpMatches, OTP_TTL_MS, OTP_MAX_ATTEMPTS, OTP_RESEND_COOLDOWN_MS } = require('../utils/otp');

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
        isPhoneVerified: user.isPhoneVerified,
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
  const code  = generateOTP();
  user.emailOTP = hashOTP(code); user.emailOTPExpire = Date.now() + OTP_TTL_MS; user.emailOTPAttempts = 0;
  await user.save({ validateBeforeSave: false });

  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;
  // Registration still succeeds if the email can't be sent; the user can request a new one from checkout.
  await sendEmail({ to: email, template: 'emailVerification', data: { name, verifyUrl, code } });

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
  user.emailOTP = undefined; user.emailOTPExpire = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, message: 'Email verified successfully' });
};

// ─── Resend verification (link + code) ──────────────────────────────────────────────────
exports.resendVerification = async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+emailOTPExpire');
  if (user.isEmailVerified) return next(new ErrorResponse('Your email is already verified', 400));

  // emailOTPExpire - TTL = when the last code was sent
  const lastSent = user.emailOTPExpire ? user.emailOTPExpire.getTime() - OTP_TTL_MS : 0;
  if (Date.now() - lastSent < OTP_RESEND_COOLDOWN_MS)
    return next(new ErrorResponse('Please wait a minute before requesting another code', 429));

  const token = user.createEmailVerificationToken();
  const code  = generateOTP();
  user.emailOTP = hashOTP(code); user.emailOTPExpire = Date.now() + OTP_TTL_MS; user.emailOTPAttempts = 0;
  await user.save({ validateBeforeSave: false });

  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;
  const sent = await sendEmail({ to: user.email, template: 'emailVerification', data: { name: user.name, verifyUrl, code } });
  if (!sent) return next(new ErrorResponse('We could not send the email right now. Please try again shortly.', 503));

  res.status(200).json({
    success: true,
    message: 'Verification email sent',
    ...(process.env.NODE_ENV === 'development' && { devCode: code }),
  });
};

// ─── Verify email with the 6-digit code ──────────────────────────────────────
exports.verifyEmailCode = async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+emailOTP +emailOTPExpire +emailOTPAttempts');
  if (user.isEmailVerified) return res.status(200).json({ success: true, message: 'Email already verified' });

  const invalid = () => next(new ErrorResponse('Invalid or expired code', 400));
  if (!user.emailOTP || !user.emailOTPExpire || user.emailOTPExpire < Date.now() || user.emailOTPAttempts >= OTP_MAX_ATTEMPTS) return invalid();

  if (!otpMatches(user.emailOTP, req.body.code)) {
    user.emailOTPAttempts += 1;
    await user.save({ validateBeforeSave: false });
    return invalid();
  }

  user.isEmailVerified = true;
  user.emailOTP = undefined; user.emailOTPExpire = undefined; user.emailOTPAttempts = 0;
  user.emailVerificationToken = undefined; user.emailVerificationExpire = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, message: 'Email verified successfully' });
};

// ─── Send Phone OTP ───────────────────────────────────────────────────────────
exports.sendPhoneOTP = async (req, res, next) => {
  const { phone } = req.body;
  if (!phone || typeof phone !== 'string') return next(new ErrorResponse('Phone number required', 400));

  const otp     = generateOTP();
  const expires = Date.now() + OTP_TTL_MS;

  let user = await User.findOne({ phone });
  if (!user) {
    user = await User.create({ phone, name: 'User', password: crypto.randomBytes(20).toString('hex'), phoneOTP: hashOTP(otp), phoneOTPExpire: expires, phoneOTPAttempts: 0 });
  } else {
    user.phoneOTP = hashOTP(otp); user.phoneOTPExpire = expires; user.phoneOTPAttempts = 0;
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
  const user = await User.findOne({ phone: String(phone || '') }).select('+phoneOTP +phoneOTPExpire +phoneOTPAttempts');
  const invalid = () => next(new ErrorResponse('Invalid or expired OTP', 400));
  if (!user || !user.phoneOTP || !user.phoneOTPExpire || user.phoneOTPExpire < Date.now() || user.phoneOTPAttempts >= OTP_MAX_ATTEMPTS) return invalid();

  if (!otpMatches(user.phoneOTP, otp)) {
    user.phoneOTPAttempts += 1;
    await user.save({ validateBeforeSave: false });
    return invalid();
  }

  user.isPhoneVerified = true; user.phoneOTP = undefined; user.phoneOTPExpire = undefined; user.phoneOTPAttempts = 0;
  await user.save({ validateBeforeSave: false });
  await sendTokens(user, 200, res);
};

// ─── Forgot Password ──────────────────────────────────────────────────────────
exports.forgotPassword = async (req, res, next) => {
  const sameReply = { success: true, message: 'If that email exists, a reset link has been sent.' };
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(200).json(sameReply);

  const token    = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
  await sendEmail({ to: user.email, template: 'passwordReset', data: { name: user.name, resetUrl } }).catch((e) => logger.error(`Reset email failed: ${e.message}`));

  res.status(200).json(sameReply);
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
