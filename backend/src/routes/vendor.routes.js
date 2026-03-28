const express  = require('express');
const router   = express.Router();
const Vendor   = require('../models/Vendor.model');
const Product  = require('../models/Product.model');
const { protect, authorize } = require('../middleware/auth.middleware');
const ErrorResponse = require('../utils/errorResponse');

// Register as vendor
router.post('/register', protect, async (req, res, next) => {
  const existing = await Vendor.findOne({ user: req.user.id });
  if (existing) return next(new ErrorResponse('Vendor account already exists', 400));
  const vendor = await Vendor.create({ ...req.body, user: req.user.id });
  const User   = require('../models/User.model');
  await User.findByIdAndUpdate(req.user.id, { role: 'vendor' });
  res.status(201).json({ success: true, data: vendor });
});

// Submit / update KYC
router.post('/kyc', protect, authorize('vendor'), async (req, res, next) => {
  const vendor = await Vendor.findOne({ user: req.user.id });
  if (!vendor) return next(new ErrorResponse('Vendor account not found', 404));
  vendor.kyc = { ...vendor.kyc, ...req.body, status: 'submitted', submittedAt: new Date() };
  await vendor.save();
  res.status(200).json({ success: true, data: vendor });
});

// Get my vendor profile
router.get('/profile', protect, authorize('vendor'), async (req, res, next) => {
  const vendor = await Vendor.findOne({ user: req.user.id });
  if (!vendor) return next(new ErrorResponse('Vendor profile not found', 404));
  res.status(200).json({ success: true, data: vendor });
});

// Update my vendor profile
router.put('/profile', protect, authorize('vendor'), async (req, res, next) => {
  const vendor = await Vendor.findOneAndUpdate({ user: req.user.id }, req.body, { new: true, runValidators: true });
  if (!vendor) return next(new ErrorResponse('Vendor profile not found', 404));
  res.status(200).json({ success: true, data: vendor });
});

// Public storefront
router.get('/:slug', async (req, res, next) => {
  const vendor   = await Vendor.findOne({ slug: req.params.slug, status: 'active' });
  if (!vendor)   return next(new ErrorResponse('Vendor not found', 404));
  const products = await Product.find({ vendor: vendor._id, status: 'active' }).limit(24).sort('-createdAt');
  res.status(200).json({ success: true, data: { vendor, products } });
});

module.exports = router;
