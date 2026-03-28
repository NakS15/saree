const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    method: { type: String, enum: ['razorpay', 'stripe', 'cod', 'upi', 'wallet'] },
    status: {
      type: String,
      enum: ['created', 'pending', 'completed', 'failed', 'refunded', 'partially_refunded'],
      default: 'created',
    },
    gateway: { type: String, enum: ['razorpay', 'stripe', 'cod'] },
    gatewayOrderId: String,
    gatewayPaymentId: String,
    gatewaySignature: String,
    refundId: String,
    refundAmount: Number,
    refundedAt: Date,
    failureReason: String,
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

paymentSchema.index({ order: 1 });
paymentSchema.index({ user: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ gatewayPaymentId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
