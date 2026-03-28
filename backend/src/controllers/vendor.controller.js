const Vendor = require('../models/Vendor.model');
const User = require('../models/User.model');
const ErrorResponse = require('../utils/errorResponse');
const slugify = require('slugify');
const { cloudinary } = require('../config/cloudinary');

// @desc    Register as vendor
// @route   POST /api/v1/vendors/register
// @access  Private (Customer)
exports.registerVendor = async (req, res) => {
  const existingVendor = await Vendor.findOne({ user: req.user.id });
  if (existingVendor) throw new ErrorResponse('You already have a vendor account', 400);

  const { businessName, businessEmail, businessPhone, businessAddress, businessDescription } = req.body;
  const slug = slugify(businessName, { lower: true, strict: true }) + '-' + Date.now();

  const vendor = await Vendor.create({
    user: req.user.id,
    businessName, businessEmail, businessPhone, businessAddress, businessDescription, slug,
    kyc: { status: 'pending', submittedAt: new Date() },
  });

  res.status(201).json({ success: true, message: 'Vendor registration submitted. Awaiting approval.', data: vendor });
};

// @desc    Submit KYC documents
// @route   POST /api/v1/vendors/kyc
// @access  Private (Vendor)
exports.submitKYC = async (req, res) => {
  const vendor = await Vendor.findOne({ user: req.user.id });
  if (!vendor) throw new ErrorResponse('Vendor account not found', 404);

  const { panNumber, gstNumber, aadharNumber, bankDetails } = req.body;

  vendor.kyc.panNumber = panNumber;
  vendor.kyc.gstNumber = gstNumber;
  vendor.kyc.aadharNumber = aadharNumber;
  vendor.kyc.status = 'under_review';
  vendor.kyc.submittedAt = new Date();
  if (bankDetails) vendor.bankDetails = bankDetails;

  await vendor.save();
  res.status(200).json({ success: true, message: 'KYC submitted for review', data: vendor });
};

// @desc    Get vendor profile
// @route   GET /api/v1/vendors/profile
// @access  Private (Vendor)
exports.getVendorProfile = async (req, res) => {
  const vendor = await Vendor.findOne({ user: req.user.id }).populate('user', 'name email phone avatar');
  if (!vendor) throw new ErrorResponse('Vendor not found', 404);
  res.status(200).json({ success: true, data: vendor });
};

// @desc    Update vendor profile
// @route   PUT /api/v1/vendors/profile
// @access  Private (Vendor)
exports.updateVendorProfile = async (req, res) => {
  const allowedFields = ['businessDescription', 'businessPhone', 'businessAddress', 'returnPolicy', 'shippingPolicy'];
  const updates = {};
  allowedFields.forEach((field) => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });

  const vendor = await Vendor.findOneAndUpdate({ user: req.user.id }, updates, { new: true, runValidators: true });
  if (!vendor) throw new ErrorResponse('Vendor not found', 404);

  res.status(200).json({ success: true, data: vendor });
};

// @desc    Get public vendor storefront
// @route   GET /api/v1/vendors/:slug
// @access  Public
exports.getVendorStorefront = async (req, res) => {
  const vendor = await Vendor.findOne({ slug: req.params.slug, status: 'active' })
    .populate('user', 'name createdAt');
  if (!vendor) throw new ErrorResponse('Vendor not found', 404);

  const Product = require('../models/Product.model');
  const products = await Product.find({ vendor: vendor._id, status: 'active' })
    .limit(20)
    .select('name price images rating slug compareAtPrice attributes.fabric');

  res.status(200).json({ success: true, data: { vendor, products } });
};
