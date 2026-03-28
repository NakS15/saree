const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  vendor:   { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  name:     { type: String, required: true },
  image:    String,
  price:    { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  color:    String,
}, { _id: false });

const statusHistorySchema = new mongoose.Schema({
  status:    String,
  note:      String,
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderNumber:  { type: String, unique: true },
  items:        [orderItemSchema],

  shippingAddress: {
    fullName: String, phone: String,
    addressLine1: String, addressLine2: String,
    city: String, state: String, pincode: String, country: String,
  },

  subtotal:       { type: Number, required: true },
  shippingCharge: { type: Number, default: 0 },
  tax:            { type: Number, default: 0 },
  discount:       { type: Number, default: 0 },
  totalAmount:    { type: Number, required: true },

  paymentMethod:  { type: String, enum: ['razorpay', 'cod', 'upi'], required: true },
  paymentStatus:  { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  payment: {
    razorpayOrderId:   String,
    razorpayPaymentId: String,
  },

  status: {
    type: String,
    enum: ['placed','confirmed','processing','shipped','out_for_delivery','delivered','cancelled','return_requested','returned','refunded'],
    default: 'placed',
  },
  statusHistory: [statusHistorySchema],

  shipping: {
    shiprocketOrderId: String,
    shipmentId:        String,
    awbCode:           String,
    trackingNumber:    String,
    trackingUrl:       String,
    courier:           String,
    estimatedDelivery: Date,
    deliveredAt:       Date,
  },

  couponCode:     String,
  notes:          String,
  returnReason:   String,
}, { timestamps: true });

// Auto-generate order number
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `SB${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ 'items.vendor': 1, status: 1 });

module.exports = mongoose.model('Order', orderSchema);
