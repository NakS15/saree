const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const addressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: String,
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true, match: /^\d{6}$/ },
  country: { type: String, default: 'India' },
  isDefault: { type: Boolean, default: false },
  type: { type: String, enum: ['home', 'work', 'other'], default: 'home' },
}, { _id: true });

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 100 },
  email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
  phone: { type: String, sparse: true, match: /^[6-9]\d{9}$/ },
  password: { type: String, minlength: 8, select: false },
  googleId: { type: String, sparse: true },
  avatar: String,
  role: { type: String, enum: ['customer', 'vendor', 'admin'], default: 'customer' },

  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },

  addresses: [addressSchema],
  preferences: {
    newsletter: { type: Boolean, default: true },
    smsAlerts: { type: Boolean, default: false },
    language: { type: String, default: 'en' },
  },

  refreshToken: { type: String, select: false },
  emailVerificationToken: { type: String, select: false },
  emailVerificationExpire: { type: Date, select: false },
  phoneOTP: { type: String, select: false },
  phoneOTPExpire: { type: Date, select: false },
  passwordResetToken: { type: String, select: false },
  passwordResetExpire: { type: Date, select: false },

  lastLogin: Date,
}, { timestamps: true });

// Hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.createEmailVerificationToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
  this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24h
  return token;
};

userSchema.methods.createPasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
  this.passwordResetExpire = Date.now() + 60 * 60 * 1000; // 1h
  return token;
};

module.exports = mongoose.model('User', userSchema);
