const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code:        { type: String, required: true, unique: true, uppercase: true, trim: true },
  description: String,
  type:        { type: String, enum: ['percentage', 'fixed', 'free_shipping'], required: true },
  value:       { type: Number, default: 0 },    // % or ₹ amount

  minOrderAmount:   { type: Number, default: 0 },
  maxDiscountAmount:{ type: Number },            // cap for percentage coupons

  usageLimit:  { type: Number },                 // null = unlimited
  usedCount:   { type: Number, default: 0 },
  perUserLimit:{ type: Number, default: 1 },
  usedBy:      [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, usedAt: { type: Date, default: Date.now } }],

  startDate:   Date,
  endDate:     Date,
  isActive:    { type: Boolean, default: true },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

couponSchema.methods.isValid = function (userId, orderAmount) {
  if (!this.isActive) return { valid: false, message: 'Coupon is inactive' };
  if (this.startDate && this.startDate > Date.now()) return { valid: false, message: 'Coupon not yet active' };
  if (this.endDate   && this.endDate   < Date.now()) return { valid: false, message: 'Coupon has expired' };
  if (this.usageLimit && this.usedCount >= this.usageLimit) return { valid: false, message: 'Coupon usage limit reached' };
  if (orderAmount < this.minOrderAmount) return { valid: false, message: `Minimum order ₹${this.minOrderAmount} required` };

  const userUses = this.usedBy.filter((u) => u.user?.toString() === userId?.toString()).length;
  if (userUses >= this.perUserLimit) return { valid: false, message: 'You have already used this coupon' };

  return { valid: true };
};

module.exports = mongoose.model('Coupon', couponSchema);
