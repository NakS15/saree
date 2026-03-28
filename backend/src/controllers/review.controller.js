const Review = require('../models/Review.model');
const Order = require('../models/Order.model');
const Product = require('../models/Product.model');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get reviews for a product
// @route   GET /api/v1/reviews/:productId
// @access  Public
exports.getProductReviews = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const filter = { product: req.params.productId, isApproved: true };
  if (req.query.rating) filter.rating = parseInt(req.query.rating);

  const reviews = await Review.find(filter)
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Review.countDocuments(filter);

  // Rating distribution
  const distribution = await Review.aggregate([
    { $match: { product: require('mongoose').Types.ObjectId(req.params.productId), isApproved: true } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
  ]);

  res.status(200).json({ success: true, count: reviews.length, total, data: reviews, distribution });
};

// @desc    Create review (verified purchase only)
// @route   POST /api/v1/reviews/:productId
// @access  Private
exports.createReview = async (req, res) => {
  const { productId } = req.params;

  const product = await Product.findById(productId);
  if (!product) throw new ErrorResponse('Product not found', 404);

  const existingReview = await Review.findOne({ product: productId, user: req.user.id });
  if (existingReview) throw new ErrorResponse('You have already reviewed this product', 400);

  // Check verified purchase
  const order = await Order.findOne({
    user: req.user.id,
    'items.product': productId,
    status: 'delivered',
  });

  const review = await Review.create({
    product: productId,
    user: req.user.id,
    order: order?._id,
    rating: req.body.rating,
    title: req.body.title,
    comment: req.body.comment,
    images: req.body.images || [],
    isVerifiedPurchase: !!order,
  });

  res.status(201).json({ success: true, message: 'Review submitted', data: review });
};

// @desc    Mark review as helpful
// @route   POST /api/v1/reviews/:reviewId/helpful
// @access  Private
exports.markHelpful = async (req, res) => {
  const review = await Review.findById(req.params.reviewId);
  if (!review) throw new ErrorResponse('Review not found', 404);

  const alreadyVoted = review.helpfulVotes.includes(req.user.id);
  if (alreadyVoted) {
    review.helpfulVotes.pull(req.user.id);
    review.helpfulCount = Math.max(0, review.helpfulCount - 1);
  } else {
    review.helpfulVotes.push(req.user.id);
    review.helpfulCount += 1;
  }
  await review.save();

  res.status(200).json({ success: true, helpfulCount: review.helpfulCount });
};

// @desc    Delete review (owner or admin)
// @route   DELETE /api/v1/reviews/:reviewId
// @access  Private
exports.deleteReview = async (req, res) => {
  const review = await Review.findById(req.params.reviewId);
  if (!review) throw new ErrorResponse('Review not found', 404);
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new ErrorResponse('Unauthorized', 403);
  }
  await review.remove();
  res.status(200).json({ success: true, message: 'Review deleted' });
};
