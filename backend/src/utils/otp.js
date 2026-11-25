const crypto = require('crypto');

// 6-digit one-time codes; only a hash is ever stored.
exports.generateOTP = () => crypto.randomInt(100000, 1000000).toString();

exports.hashOTP = (code) => crypto.createHash('sha256').update(String(code)).digest('hex');

exports.otpMatches = (storedHash, code) => {
  const a = Buffer.from(String(storedHash || ''));
  const b = Buffer.from(exports.hashOTP(code));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

exports.OTP_TTL_MS = 10 * 60 * 1000;
exports.OTP_MAX_ATTEMPTS = 5;
exports.OTP_RESEND_COOLDOWN_MS = 60 * 1000;
