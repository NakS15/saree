const Order      = require('../models/Order.model');
const Cart       = require('../models/Cart.model');
const Product    = require('../models/Product.model');
const Vendor     = require('../models/Vendor.model');
const ErrorResponse   = require('../utils/errorResponse');
const sendEmail       = require('../utils/sendEmail');
const shiprocket      = require('../utils/shiprocket');
const { formatPrice } = require('../utils/helpers') || { formatPrice: (n) => `₹${n}` };

// ─── GET /orders/my-orders ────────────────────────────────────────────────────
exports.getMyOrders = async (req, res) => {
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 10;
  const filter = { user: req.user.id };
  if (req.query.status) filter.status = req.query.status;

  const orders = await Order.find(filter)
    .sort('-createdAt').skip((page-1)*limit).limit(limit)
    .populate('items.product', 'name slug images');
  const total = await Order.countDocuments(filter);

  res.status(200).json({ success: true, data: orders, total, totalPages: Math.ceil(total/limit) });
};

// ─── GET /orders/:id ──────────────────────────────────────────────────────────
exports.getOrder = async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('user',           'name email phone')
    .populate('items.product',  'name slug images attributes');

  if (!order) return next(new ErrorResponse('Order not found', 404));
  if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin')
    return next(new ErrorResponse('Not authorized', 403));

  res.status(200).json({ success: true, data: order });
};

// ─── PUT /orders/:id/cancel ───────────────────────────────────────────────────
exports.cancelOrder = async (req, res, next) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
  if (!order) return next(new ErrorResponse('Order not found', 404));
  if (!['placed','confirmed'].includes(order.status))
    return next(new ErrorResponse('Order cannot be cancelled at this stage', 400));

  order.status = 'cancelled';
  order.statusHistory.push({ status: 'cancelled', note: req.body.reason || 'Cancelled by customer' });

  // Restore stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
  }
  await order.save();

  await sendEmail({ to: req.user.email, template: 'orderCancelled', data: { order } }).catch(() => {});
  res.status(200).json({ success: true, data: order });
};

// ─── GET /orders/vendor/orders ────────────────────────────────────────────────
exports.getVendorOrders = async (req, res) => {
  const vendor = await Vendor.findOne({ user: req.user.id });
  if (!vendor) return res.status(200).json({ success: true, data: [], total: 0 });

  const page   = parseInt(req.query.page)  || 1;
  const limit  = parseInt(req.query.limit) || 10;
  const filter = { 'items.vendor': vendor._id };
  if (req.query.status) filter.status = req.query.status;

  const orders = await Order.find(filter)
    .sort('-createdAt').skip((page-1)*limit).limit(limit)
    .populate('user', 'name email phone')
    .populate('items.product', 'name images');
  const total = await Order.countDocuments(filter);

  res.status(200).json({ success: true, data: orders, total, totalPages: Math.ceil(total/limit) });
};

// ─── PUT /orders/:id/vendor-update ───────────────────────────────────────────
exports.updateOrderStatus = async (req, res, next) => {
  const { status, note } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return next(new ErrorResponse('Order not found', 404));

  order.status = status;
  order.statusHistory.push({ status, note, updatedBy: req.user.id });
  await order.save();

  res.status(200).json({ success: true, data: order });
};

// ─── POST /orders/:id/create-shipment ────────────────────────────────────────
exports.createShipment = async (req, res, next) => {
  const order  = await Order.findById(req.params.id).populate('user', 'email name');
  const vendor = await Vendor.findOne({ user: req.user.id });
  if (!order || !vendor) return next(new ErrorResponse('Order or vendor not found', 404));

  try {
    const result = await shiprocket.createOrder(order, vendor);
    order.shipping = {
      shiprocketOrderId: result.order_id,
      shipmentId:        result.shipment_id,
      awbCode:           result.awb_code,
      trackingNumber:    result.awb_code,
      trackingUrl:       `https://www.shiprocket.in/shipment-tracking/?awb=${result.awb_code}`,
    };
    order.status = 'shipped';
    order.statusHistory.push({ status: 'shipped', note: `AWB: ${result.awb_code}` });
    await order.save();
    res.status(200).json({ success: true, data: order });
  } catch (err) {
    return next(new ErrorResponse(`Shiprocket error: ${err.message}`, 500));
  }
};

// ─── GET /orders/:id/track ────────────────────────────────────────────────────
exports.trackOrder = async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) return next(new ErrorResponse('Order not found', 404));
  if (!order.shipping?.awbCode) return res.status(200).json({ success: true, data: { status: order.status } });

  const tracking = await shiprocket.trackOrder(order.shipping.awbCode);
  res.status(200).json({ success: true, data: tracking });
};

// ─── GET /orders/vendor/analytics ────────────────────────────────────────────
exports.getVendorAnalytics = async (req, res) => {
  const vendor = await Vendor.findOne({ user: req.user.id });
  if (!vendor) return res.status(200).json({ success: true, data: {} });

  const days  = parseInt(req.query.period) || 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [revenueStats, orderStats, topProducts] = await Promise.all([
    Order.aggregate([
      { $match: { 'items.vendor': vendor._id, createdAt: { $gte: since }, status: { $ne: 'cancelled' } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([
      { $match: { 'items.vendor': vendor._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { 'items.vendor': vendor._id, status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      { $match: { 'items.vendor': vendor._id } },
      { $group: { _id: '$items.product', totalSold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
    ]),
  ]);

  res.status(200).json({
    success: true,
    data: {
      vendor: {
        totalRevenue:   vendor.totalRevenue,
        totalOrders:    vendor.totalOrders,
        totalProducts:  await require('../models/Product.model').countDocuments({ vendor: vendor._id }),
        pendingPayout:  vendor.totalRevenue * (1 - (process.env.PLATFORM_COMMISSION_PERCENT || 10) / 100),
        rating:         vendor.rating,
      },
      revenueStats, orderStats, topProducts,
    },
  });
};
