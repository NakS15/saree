const Product   = require('../models/Product.model');
const Vendor    = require('../models/Vendor.model');
const APIFeatures = require('../utils/apiFeatures');
const ErrorResponse = require('../utils/errorResponse');
const { cloudinary } = require('../config/cloudinary');

// ─── GET /products ────────────────────────────────────────────────────────────
exports.getProducts = async (req, res) => {
  const features = new APIFeatures(
    Product.find({ status: 'active' })
      .populate('vendor',   'businessName slug logo rating')
      .populate('category', 'name slug'),
    req.query
  ).filter().sort().paginate();

  const products    = await features.query;
  const total       = await Product.countDocuments(features.filterQuery);
  const totalPages  = Math.ceil(total / (req.query.limit || 12));

  res.status(200).json({ success: true, total, totalPages, data: products });
};

// ─── GET /products/:slug ──────────────────────────────────────────────────────
exports.getProduct = async (req, res, next) => {
  const product = await Product.findOne({ slug: req.params.slug, status: 'active' })
    .populate('vendor',   'businessName slug logo rating totalOrders returnPolicy')
    .populate('category', 'name slug');

  if (!product) return next(new ErrorResponse('Product not found', 404));

  // Increment view count
  product.views = (product.views || 0) + 1;
  await product.save({ validateBeforeSave: false });

  // Related products
  const related = await Product.find({
    _id:      { $ne: product._id },
    category: product.category?._id,
    status:   'active',
  }).limit(8).select('name slug price compareAtPrice images rating numReviews vendor attributes');

  res.status(200).json({ success: true, data: product, related });
};

// ─── GET /products/featured ───────────────────────────────────────────────────
exports.getFeatured = async (req, res) => {
  const products = await Product.find({ isFeatured: true, status: 'active' })
    .limit(12).populate('vendor', 'businessName slug').sort('-createdAt');
  res.status(200).json({ success: true, data: products });
};

// ─── GET /products/trending ───────────────────────────────────────────────────
exports.getTrending = async (req, res) => {
  const products = await Product.find({ isTrending: true, status: 'active' })
    .limit(12).populate('vendor', 'businessName slug').sort('-totalSales');
  res.status(200).json({ success: true, data: products });
};

// ─── GET /products/search/autocomplete ───────────────────────────────────────
exports.searchAutocomplete = async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) return res.status(200).json({ success: true, data: [] });

  const products = await Product.find(
    { $text: { $search: q }, status: 'active' },
    { score: { $meta: 'textScore' }, name: 1, slug: 1, price: 1, images: 1 }
  ).sort({ score: { $meta: 'textScore' } }).limit(8);

  res.status(200).json({ success: true, data: products });
};

// ─── GET /products/vendor/my-products ────────────────────────────────────────
exports.getMyProducts = async (req, res) => {
  const vendor = await Vendor.findOne({ user: req.user.id });
  if (!vendor) return res.status(200).json({ success: true, data: [], total: 0 });

  const page   = parseInt(req.query.page)  || 1;
  const limit  = parseInt(req.query.limit) || 10;
  const filter = { vendor: vendor._id };
  if (req.query.status) filter.status = req.query.status;

  const products   = await Product.find(filter).skip((page-1)*limit).limit(limit).sort('-createdAt');
  const total      = await Product.countDocuments(filter);

  res.status(200).json({ success: true, data: products, total, totalPages: Math.ceil(total/limit) });
};

// ─── POST /products ───────────────────────────────────────────────────────────
exports.createProduct = async (req, res, next) => {
  const vendor = await Vendor.findOne({ user: req.user.id, status: 'active' });
  if (!vendor) return next(new ErrorResponse('Active vendor account required to list products', 403));

  const product = await Product.create({ ...req.body, vendor: vendor._id, status: 'pending_approval' });
  res.status(201).json({ success: true, data: product });
};

// ─── PUT /products/:id ────────────────────────────────────────────────────────
exports.updateProduct = async (req, res, next) => {
  const vendor  = await Vendor.findOne({ user: req.user.id });
  let product   = await Product.findOne({ _id: req.params.id, vendor: vendor?._id });
  if (!product) return next(new ErrorResponse('Product not found', 404));

  // Re-submit for approval if price/images changed
  if (req.body.price || req.body.images) req.body.status = 'pending_approval';

  product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.status(200).json({ success: true, data: product });
};

// ─── DELETE /products/:id ─────────────────────────────────────────────────────
exports.deleteProduct = async (req, res, next) => {
  const vendor  = await Vendor.findOne({ user: req.user.id });
  const product = await Product.findOne({ _id: req.params.id, vendor: vendor?._id });
  if (!product) return next(new ErrorResponse('Product not found', 404));

  product.status = 'archived';
  await product.save();
  res.status(200).json({ success: true, message: 'Product archived' });
};
