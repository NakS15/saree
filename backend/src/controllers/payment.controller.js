const crypto     = require('crypto');

const razorpayConfigured =
  process.env.RAZORPAY_KEY_ID &&
  process.env.RAZORPAY_KEY_ID !== 'REPLACE_WITH_YOUR_RAZORPAY_KEY_ID';

const Razorpay = razorpayConfigured ? require('razorpay') : null;
const Order      = require('../models/Order.model');
const Cart       = require('../models/Cart.model');
const Product    = require('../models/Product.model');
const User       = require('../models/User.model');
const Vendor     = require('../models/Vendor.model');
const Coupon     = require('../models/Coupon.model');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail     = require('../utils/sendEmail');
const logger        = require('../config/logger');

const razorpay = razorpayConfigured
  ? new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET })
  : null;

// ─── Shared order builder ─────────────────────────────────────────────────────
const buildOrder = async (userId, { shippingAddressId, shippingOption, couponCode }) => {
  const user = await User.findById(userId);
  const cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart?.items?.length) throw new Error('Cart is empty');

  const address = user.addresses.id(shippingAddressId);
  if (!address) throw new Error('Shipping address not found');

  const shippingCharge = shippingOption === 'express' ? 199 : (cart.subtotal >= 999 ? 0 : 99);
  const tax            = Math.round(cart.subtotal * 0.05);
  let   discount       = 0;
  let   couponDoc      = null;

  if (couponCode) {
    couponDoc = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (couponDoc) {
      const validity = couponDoc.isValid(userId, cart.subtotal);
      if (validity.valid) {
        if (couponDoc.type === 'percentage') discount = Math.min((couponDoc.value / 100) * cart.subtotal, couponDoc.maxDiscountAmount || Infinity);
        else if (couponDoc.type === 'fixed') discount = couponDoc.value;
        discount = Math.round(discount);
      }
    }
  }

  const totalAmount = cart.subtotal + shippingCharge + tax - discount;

  const items = cart.items.map((item) => ({
    product:  item.product._id,
    vendor:   item.product.vendor,
    name:     item.product.name,
    image:    item.product.images?.[0]?.url,
    price:    item.price,
    quantity: item.quantity,
    color:    item.color,
  }));

  return { user, cart, address, shippingCharge, tax, discount, couponDoc, totalAmount, items };
};

// ─── POST /payments/razorpay/create-order ────────────────────────────────────
exports.createRazorpayOrder = async (req, res, next) => {
  if (!razorpay) return next(new ErrorResponse('Razorpay is not configured. Use COD for now.', 503));
  const { shippingAddressId, shippingOption, couponCode } = req.body;
  const { totalAmount, items, address, shippingCharge, tax, discount } =
    await buildOrder(req.user.id, { shippingAddressId, shippingOption, couponCode });

  const rzpOrder = await razorpay.orders.create({
    amount:   Math.round(totalAmount * 100), // paise
    currency: 'INR',
    receipt:  `rcpt_${Date.now()}`,
    notes:    { userId: req.user.id },
  });

  res.status(200).json({
    success: true,
    data: {
      orderId:   rzpOrder.id,
      amount:    rzpOrder.amount,
      currency:  rzpOrder.currency,
      keyId:     process.env.RAZORPAY_KEY_ID,
      summary:   { subtotal: items.reduce((s,i)=>s+i.price*i.quantity,0), shippingCharge, tax, discount, totalAmount },
    },
  });
};

// ─── POST /payments/razorpay/verify ──────────────────────────────────────────
exports.verifyRazorpayPayment = async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData, shippingAddressId, shippingOption, couponCode } = req.body;

  // Verify signature
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSig = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex');
  if (expectedSig !== razorpay_signature) return next(new ErrorResponse('Payment verification failed', 400));

  const { user, cart, address, shippingCharge, tax, discount, couponDoc, totalAmount, items } =
    await buildOrder(req.user.id, { shippingAddressId: shippingAddressId || orderData?.shippingAddressId, shippingOption: shippingOption || 'standard', couponCode });

  const order = await Order.create({
    user:            user._id,
    items,
    shippingAddress: address.toObject(),
    subtotal:        cart.subtotal,
    shippingCharge,
    tax,
    discount,
    totalAmount,
    paymentMethod:   'razorpay',
    paymentStatus:   'paid',
    status:          'confirmed',
    payment: { razorpayOrderId: razorpay_order_id, razorpayPaymentId: razorpay_payment_id },
    statusHistory:   [{ status: 'placed' }, { status: 'confirmed', note: 'Payment received' }],
  });

  // Post-order tasks
  await Cart.findOneAndUpdate({ user: user._id }, { items: [], couponCode: null, couponDiscount: 0 });
  if (couponDoc) { couponDoc.usedCount++; couponDoc.usedBy.push({ user: user._id }); await couponDoc.save(); }
  for (const item of items) await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity, totalSales: item.quantity } });

  await sendEmail({ to: user.email, template: 'orderConfirmation', data: { order, user } }).catch(() => {});

  res.status(201).json({ success: true, data: order });
};

// ─── POST /payments/cod ───────────────────────────────────────────────────────
exports.createCODOrder = async (req, res, next) => {
  const { shippingAddressId, shippingOption, couponCode } = req.body;
  const { user, cart, address, shippingCharge, tax, discount, couponDoc, totalAmount, items } =
    await buildOrder(req.user.id, { shippingAddressId, shippingOption, couponCode });

  const order = await Order.create({
    user: user._id, items,
    shippingAddress: address.toObject(),
    subtotal:        cart.subtotal,
    shippingCharge:  shippingCharge + 49, // COD fee
    tax,   discount,
    totalAmount:     totalAmount + 49,
    paymentMethod:   'cod',
    paymentStatus:   'pending',
    status:          'confirmed',
    statusHistory:   [{ status: 'placed' }, { status: 'confirmed' }],
  });

  await Cart.findOneAndUpdate({ user: user._id }, { items: [], couponCode: null, couponDiscount: 0 });
  if (couponDoc) { couponDoc.usedCount++; couponDoc.usedBy.push({ user: user._id }); await couponDoc.save(); }
  for (const item of items) await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity, totalSales: item.quantity } });

  await sendEmail({ to: user.email, template: 'orderConfirmation', data: { order, user } }).catch(() => {});

  res.status(201).json({ success: true, data: order });
};

// ─── POST /payments/webhook/razorpay ─────────────────────────────────────────
exports.razorpayWebhook = async (req, res) => {
  const sig  = req.headers['x-razorpay-signature'];
  const body = req.body.toString();
  const expectedSig = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET).update(body).digest('hex');

  if (sig !== expectedSig) { logger.warn('Invalid Razorpay webhook signature'); return res.status(400).send('Invalid signature'); }

  const event = JSON.parse(body);
  logger.info(`Razorpay webhook: ${event.event}`);

  if (event.event === 'payment.failed') {
    const orderId = event.payload.payment.entity.notes?.orderId;
    if (orderId) await Order.findByIdAndUpdate(orderId, { paymentStatus: 'failed' });
  }

  res.status(200).json({ received: true });
};

// ─── POST /payments/refund/:orderId ──────────────────────────────────────────
exports.requestRefund = async (req, res, next) => {
  const order = await Order.findOne({ _id: req.params.orderId, user: req.user.id });
  if (!order) return next(new ErrorResponse('Order not found', 404));
  if (order.status !== 'delivered') return next(new ErrorResponse('Only delivered orders can be refunded', 400));

  if (order.payment?.razorpayPaymentId) {
    await razorpay.payments.refund(order.payment.razorpayPaymentId, { amount: order.totalAmount * 100 });
  }

  order.paymentStatus = 'refunded';
  order.status        = 'refunded';
  order.statusHistory.push({ status: 'refunded', note: req.body.reason });
  await order.save();

  res.status(200).json({ success: true, message: 'Refund initiated' });
};
