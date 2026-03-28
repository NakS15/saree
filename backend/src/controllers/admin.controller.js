const User       = require('../models/User.model');
const Order      = require('../models/Order.model');
const Product    = require('../models/Product.model');
const Vendor     = require('../models/Vendor.model');
const Coupon     = require('../models/Coupon.model');
const Category   = require('../models/Category.model');
const ErrorResponse = require('../utils/errorResponse');

// ─── GET /admin/analytics ─────────────────────────────────────────────────────
exports.getAnalytics = async (req, res) => {
  const days  = parseInt(req.query.period) || 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [summary, revenueStats, orderStatusStats, newUserStats] = await Promise.all([
    // Platform summary
    Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'vendor', isActive: true }),
      Product.countDocuments({ status: 'active' }),
      Order.countDocuments(),
      Order.aggregate([{ $group: { _id: null, gmv: { $sum: '$totalAmount' } } }]),
      Vendor.countDocuments({ status: 'pending' }),
      Product.countDocuments({ status: 'pending_approval' }),
    ]).then(([users, vendors, products, orders, revenue, pendingVendors, pendingProducts]) => ({
      totalUsers:       users,
      totalVendors:     vendors,
      totalProducts:    products,
      totalOrders:      orders,
      gmv:              revenue[0]?.gmv || 0,
      platformRevenue:  (revenue[0]?.gmv || 0) * (process.env.PLATFORM_COMMISSION_PERCENT || 10) / 100,
      pendingVendors,
      pendingProducts,
    })),

    // Revenue per day
    Order.aggregate([
      { $match: { createdAt: { $gte: since }, status: { $ne: 'cancelled' } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),

    // Order status distribution
    Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),

    // New user signups per day
    User.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  res.status(200).json({ success: true, data: { summary, revenueStats, orderStatusStats, newUserStats } });
};

// ─── GET /admin/users ─────────────────────────────────────────────────────────
exports.getUsers = async (req, res) => {
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 20;
  const filter = {};
  if (req.query.role)   filter.role   = req.query.role;
  if (req.query.search) filter.$or    = [{ name: new RegExp(req.query.search, 'i') }, { email: new RegExp(req.query.search, 'i') }];

  const users = await User.find(filter).select('-password -refreshToken')
    .sort('-createdAt').skip((page-1)*limit).limit(limit);
  const total = await User.countDocuments(filter);

  res.status(200).json({ success: true, data: users, total });
};

// ─── PUT /admin/users/:id/toggle-status ───────────────────────────────────────
exports.toggleUserStatus = async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new ErrorResponse('User not found', 404));
  user.isActive = !user.isActive;
  await user.save({ validateBeforeSave: false });
  res.status(200).json({ success: true, data: { isActive: user.isActive } });
};

// ─── GET /admin/vendors ───────────────────────────────────────────────────────
exports.getVendors = async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const vendors = await Vendor.find(filter).populate('user', 'name email createdAt').sort('-createdAt');
  res.status(200).json({ success: true, data: vendors });
};

// ─── PUT /admin/vendors/:id/review ────────────────────────────────────────────
exports.reviewVendor = async (req, res, next) => {
  const { action, reason } = req.body;
  const vendor = await Vendor.findById(req.params.id).populate('user', 'name email');
  if (!vendor) return next(new ErrorResponse('Vendor not found', 404));

  const statusMap = { approve: 'active', reject: 'rejected', suspend: 'suspended' };
  vendor.status = statusMap[action] || vendor.status;
  if (reason) vendor.rejectionReason = reason;
  await vendor.save();

  const sendEmail = require('../utils/sendEmail');
  await sendEmail({ to: vendor.user.email, template: 'vendorReview', data: { vendor, action, reason } }).catch(() => {});

  res.status(200).json({ success: true, data: vendor });
};

// ─── GET /admin/products/pending ─────────────────────────────────────────────
exports.getPendingProducts = async (req, res) => {
  const products = await Product.find({ status: 'pending_approval' })
    .populate('vendor',   'businessName')
    .populate('category', 'name')
    .sort('createdAt');
  res.status(200).json({ success: true, data: products });
};

// ─── PUT /admin/products/:id/review ──────────────────────────────────────────
exports.reviewProduct = async (req, res, next) => {
  const { action, note } = req.body;
  const product = await Product.findById(req.params.id).populate('vendor');
  if (!product) return next(new ErrorResponse('Product not found', 404));

  product.status = action === 'approve' ? 'active' : 'rejected';
  if (note) product.adminNote = note;
  await product.save();

  res.status(200).json({ success: true, data: product });
};

// ─── GET /admin/orders ────────────────────────────────────────────────────────
exports.getAllOrders = async (req, res) => {
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 20;
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const orders = await Order.find(filter)
    .populate('user', 'name email')
    .sort('-createdAt').skip((page-1)*limit).limit(limit);
  const total  = await Order.countDocuments(filter);

  res.status(200).json({ success: true, data: orders, total });
};

// ─── Category CRUD ────────────────────────────────────────────────────────────
exports.getCategories   = async (req, res) => res.status(200).json({ success: true, data: await Category.find().sort('order name') });
exports.createCategory  = async (req, res) => res.status(201).json({ success: true, data: await Category.create(req.body) });
exports.updateCategory  = async (req, res, next) => {
  const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!cat) return next(new ErrorResponse('Category not found', 404));
  res.status(200).json({ success: true, data: cat });
};
exports.deleteCategory  = async (req, res, next) => {
  const cat = await Category.findById(req.params.id);
  if (!cat) return next(new ErrorResponse('Category not found', 404));
  await cat.deleteOne();
  res.status(200).json({ success: true, message: 'Category deleted' });
};

// ─── Coupon CRUD ──────────────────────────────────────────────────────────────
exports.getCoupons   = async (req, res) => res.status(200).json({ success: true, data: await Coupon.find().sort('-createdAt') });
exports.createCoupon = async (req, res) => res.status(201).json({ success: true, data: await Coupon.create({ ...req.body, createdBy: req.user.id }) });
exports.deleteCoupon = async (req, res, next) => {
  const c = await Coupon.findByIdAndDelete(req.params.id);
  if (!c) return next(new ErrorResponse('Coupon not found', 404));
  res.status(200).json({ success: true, message: 'Coupon deleted' });
};
