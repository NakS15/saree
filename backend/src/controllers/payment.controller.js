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

const RETURN_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
const COD_FEE = 49;
const COD_NEW_ACCOUNT_LIMIT = parseInt(process.env.COD_NEW_ACCOUNT_LIMIT) || 5000;
const OPEN_STATUSES = ['placed', 'confirmed', 'processing', 'shipped', 'out_for_delivery'];

const safeEqual = (a, b) => {
  const x = Buffer.from(String(a || ''));
  const y = Buffer.from(String(b || ''));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

// Atomically take stock so concurrent checkouts can't oversell; rolls back on failure.
const reserveStock = async (items) => {
  const taken = [];
  for (const it of items) {
    const r = await Product.updateOne(
      { _id: it.product, stock: { $gte: it.quantity } },
      { $inc: { stock: -it.quantity, totalSales: it.quantity } },
    );
    if (!r.modifiedCount) {
      for (const t of taken) await Product.updateOne({ _id: t.product }, { $inc: { stock: t.quantity, totalSales: -t.quantity } });
      throw new ErrorResponse(`${it.name} just went out of stock`, 409);
    }
    taken.push(it);
  }
};

// ─── Shared order builder ─────────────────────────────────────────────────────
const buildOrder = async (userId, { shippingAddressId, shippingOption, couponCode }) => {
  const user = await User.findById(userId);
  const cart = await Cart.findOne({ user: userId }).populate('items.product');
  // Prices and stock always come from the live product, never from the cart snapshot.
  const live = (cart?.items || []).filter((i) => i.product && i.product.status === 'active');
  if (!live.length) throw new ErrorResponse('Cart is empty', 400);
  for (const i of live) {
    if (!Number.isInteger(i.quantity) || i.quantity < 1) throw new ErrorResponse('Invalid quantity in cart', 400);
    if (i.product.stock < i.quantity) throw new ErrorResponse(`Insufficient stock for ${i.product.name}`, 409);
  }

  const address = user.addresses.id(shippingAddressId);
  if (!address) throw new ErrorResponse('Shipping address not found', 400);

  const subtotal       = live.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const shippingCharge = shippingOption === 'express' ? 199 : (subtotal >= 999 ? 0 : 99);
  const tax            = Math.round(subtotal * 0.05);
  let   discount       = 0;
  let   couponDoc      = null;

  if (couponCode) {
    couponDoc = await Coupon.findOne({ code: String(couponCode).toUpperCase() });
    if (couponDoc) {
      const validity = couponDoc.isValid(userId, subtotal);
      if (validity.valid) {
        if (couponDoc.type === 'percentage') discount = Math.min((couponDoc.value / 100) * subtotal, couponDoc.maxDiscountAmount || Infinity);
        else if (couponDoc.type === 'fixed') discount = couponDoc.value;
        discount = Math.max(0, Math.min(Math.round(discount), subtotal));
      } else {
        couponDoc = null;
      }
    }
  }

  const totalAmount = subtotal + shippingCharge + tax - discount;

  const items = live.map((item) => ({
    product:  item.product._id,
    vendor:   item.product.vendor,
    name:     item.product.name,
    image:    item.product.images?.[0]?.url,
    price:    item.product.price,
    quantity: item.quantity,
    color:    item.color,
  }));

  return { user, subtotal, address, shippingCharge, tax, discount, couponDoc, totalAmount, items };
};

// ─── POST /payments/razorpay/create-order ────────────────────────────────────
exports.createRazorpayOrder = async (req, res, next) => {
  if (!razorpay) return next(new ErrorResponse('Razorpay is not configured. Use COD for now.', 503));
  const { shippingAddressId, shippingOption, couponCode } = req.body;
  const { totalAmount, items, subtotal, shippingCharge, tax, discount } =
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
      summary:   { subtotal, shippingCharge, tax, discount, totalAmount },
    },
  });
};

// ─── POST /payments/razorpay/verify ──────────────────────────────────────────
exports.verifyRazorpayPayment = async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData, shippingAddressId, shippingOption, couponCode } = req.body;

  if (!razorpay) return next(new ErrorResponse('Razorpay is not configured', 503));
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return next(new ErrorResponse('Missing payment details', 400));

  // Verify signature
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSig = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex');
  if (!safeEqual(expectedSig, razorpay_signature)) return next(new ErrorResponse('Payment verification failed', 400));

  // A payment can only ever fulfil one order
  if (await Order.exists({ 'payment.razorpayPaymentId': razorpay_payment_id })) return next(new ErrorResponse('Payment already used', 400));

  const rzpOrder = await razorpay.orders.fetch(razorpay_order_id);
  if (rzpOrder.notes?.userId !== req.user.id) return next(new ErrorResponse('Payment does not belong to this account', 403));

  const { user, subtotal, address, shippingCharge, tax, discount, couponDoc, totalAmount, items } =
    await buildOrder(req.user.id, { shippingAddressId: shippingAddressId || orderData?.shippingAddressId, shippingOption: shippingOption || 'standard', couponCode });

  // What was paid must equal what the cart costs right now
  if (rzpOrder.amount !== Math.round(totalAmount * 100)) return next(new ErrorResponse('Paid amount does not match the order total', 400));

  await reserveStock(items);

  const order = await Order.create({
    user:            user._id,
    items,
    shippingAddress: address.toObject(),
    subtotal,
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
  await Cart.findOneAndUpdate({ user: user._id }, { items: [], subtotal: 0, couponCode: null, couponDiscount: 0 });
  if (couponDoc) { couponDoc.usedCount++; couponDoc.usedBy.push({ user: user._id }); await couponDoc.save(); }

  await sendEmail({ to: user.email, template: 'orderConfirmation', data: { order, user } }).catch(() => {});

  res.status(201).json({ success: true, data: order });
};

// ─── POST /payments/cod ───────────────────────────────────────────────────────
exports.createCODOrder = async (req, res, next) => {
  const { shippingAddressId, shippingOption, couponCode } = req.body;
  const { user, subtotal, address, shippingCharge, tax, discount, couponDoc, totalAmount, items } =
    await buildOrder(req.user.id, { shippingAddressId, shippingOption, couponCode });

  // Cash on Delivery has no payment to back it, so new accounts get a cap and one open COD order at a time
  if (!(await Order.exists({ user: user._id, status: 'delivered' })) && totalAmount + COD_FEE > COD_NEW_ACCOUNT_LIMIT)
    return next(new ErrorResponse(`Cash on Delivery is limited to ₹${COD_NEW_ACCOUNT_LIMIT.toLocaleString('en-IN')} on your first order. Please pay online or reduce your order.`, 400));
  if (await Order.exists({ user: user._id, paymentMethod: 'cod', status: { $in: OPEN_STATUSES } }))
    return next(new ErrorResponse('You already have a Cash on Delivery order in progress. Please pay online or wait until it is delivered.', 400));

  await reserveStock(items);

  const order = await Order.create({
    user: user._id, items,
    shippingAddress: address.toObject(),
    subtotal,
    shippingCharge:  shippingCharge + COD_FEE, // COD fee
    tax,   discount,
    totalAmount:     totalAmount + COD_FEE,
    paymentMethod:   'cod',
    paymentStatus:   'pending',
    status:          'confirmed',
    statusHistory:   [{ status: 'placed' }, { status: 'confirmed' }],
  });

  await Cart.findOneAndUpdate({ user: user._id }, { items: [], subtotal: 0, couponCode: null, couponDiscount: 0 });
  if (couponDoc) { couponDoc.usedCount++; couponDoc.usedBy.push({ user: user._id }); await couponDoc.save(); }

  await sendEmail({ to: user.email, template: 'orderConfirmation', data: { order, user } }).catch(() => {});

  res.status(201).json({ success: true, data: order });
};

// ─── POST /payments/webhook/razorpay ─────────────────────────────────────────
exports.razorpayWebhook = async (req, res) => {
  if (!process.env.RAZORPAY_WEBHOOK_SECRET) return res.status(503).send('Webhook not configured');
  const sig  = req.headers['x-razorpay-signature'];
  const body = req.body.toString();
  const expectedSig = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET).update(body).digest('hex');

  if (!safeEqual(sig, expectedSig)) { logger.warn('Invalid Razorpay webhook signature'); return res.status(400).send('Invalid signature'); }

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
  if (order.status !== 'delivered') return next(new ErrorResponse('Only delivered orders can be returned', 400));

  const deliveredEntry = [...order.statusHistory].reverse().find((h) => h.status === 'delivered');
  const deliveredAt    = order.shipping?.deliveredAt || deliveredEntry?.timestamp;
  if (!deliveredAt || Date.now() - new Date(deliveredAt).getTime() > RETURN_WINDOW_MS)
    return next(new ErrorResponse('The 7-day return window has passed', 400));

  order.status       = 'return_requested';
  order.returnReason = String(req.body.reason || '').slice(0, 500);
  order.statusHistory.push({ status: 'return_requested', note: order.returnReason });
  await order.save();

  res.status(200).json({ success: true, message: 'Return requested. Refund is issued once the return is approved.' });
};

// ─── POST /payments/refund/:orderId/approve (admin) ─────────────────────────
exports.approveRefund = async (req, res, next) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) return next(new ErrorResponse('Order not found', 404));
  if (order.status !== 'return_requested') return next(new ErrorResponse('No return has been requested for this order', 400));

  if (order.payment?.razorpayPaymentId) {
    if (!razorpay) return next(new ErrorResponse('Razorpay is not configured', 503));
    await razorpay.payments.refund(order.payment.razorpayPaymentId, { amount: Math.round(order.totalAmount * 100) });
    order.paymentStatus = 'refunded';
  }

  order.status = order.paymentStatus === 'refunded' ? 'refunded' : 'returned';
  order.statusHistory.push({ status: order.status, note: 'Return approved', updatedBy: req.user.id });
  await order.save();

  res.status(200).json({ success: true, message: 'Return approved' });
};
