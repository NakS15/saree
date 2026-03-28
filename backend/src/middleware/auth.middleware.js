const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const ErrorResponse = require('../utils/errorResponse');

// ─── Protect (require valid access token) ────────────────────────────────────
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) return next(new ErrorResponse('Not authenticated', 401));

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select('-password -refreshToken');
  if (!user) return next(new ErrorResponse('User not found', 401));
  if (!user.isActive) return next(new ErrorResponse('Account suspended', 403));

  req.user = user;
  next();
};

// ─── Authorize (require specific role(s)) ────────────────────────────────────
exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return next(new ErrorResponse(`Role '${req.user?.role}' is not authorized for this action`, 403));
  }
  next();
};

// ─── Optional auth (attaches user if token present, doesn't fail if absent) ──
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) token = req.headers.authorization.split(' ')[1];
    else if (req.cookies?.accessToken) token = req.cookies.accessToken;

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    }
  } catch { /* ignore */ }
  next();
};
