const express  = require('express');
const router   = express.Router();
const Review   = require('../models/Review.model');
const Order    = require('../models/Order.model');
const Product  = require('../models/Product.model');
const { protect, optionalAuth } = require('../middleware/auth.middleware');
const ErrorResponse = require('../utils/errorResponse');

// GET /reviews/:productId
router.get('/:productId', optionalAuth, async (req, res) => {
  const page   = parseInt(req.query.page)  || 1;
  const limit  = parseInt(req.query.limit) || 8;
  const filter = { product: req.params.productId };
  if (req.query.rating) filter.rating = parseInt(req.query.rating);

  const reviews      = await Review.find(filter)
    .populate('user', 'name avatar')
    .sort('-createdAt').skip((page-1)*limit).limit(limit);
  const total        = await Review.countDocuments(filter);
  const distribution = await Review.aggregate([
    { $match: { product: require('mongoose').Types.ObjectId.createFromHexString(req.params.productId) } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
    { $sort: { _id: -1 } },
  ]);

  res.status(200).json({ success: true, data: reviews, total, distribution });
});

// POST /reviews/:productId
router.post('/:productId', protect, async (req, res, next) => {
  const existing = await Review.findOne({ product: req.params.productId, user: req.user.id });
  if (existing) return next(new ErrorResponse('You have already reviewed this product', 400));

  const hasPurchased = await Order.findOne({
    user: req.user.id,
    'items.product': req.params.productId,
    status: 'delivered',
  });

  const review = await Review.create({
    product:           req.params.productId,
    user:              req.user.id,
    rating:            req.body.rating,
    title:             req.body.title,
    comment:           req.body.comment,
    images:            req.body.images,
    isVerifiedPurchase:!!hasPurchased,
  });

  // Recalculate product rating
  const stats = await Review.aggregate([
    { $match: { product: review.product } },
    { $group: { _id: '$product', avgRating: { $avg: '$rating' }, numReviews: { $sum: 1 } } },
  ]);
  if (stats.length) {
    await Product.findByIdAndUpdate(req.params.productId, { rating: stats[0].avgRating, numReviews: stats[0].numReviews });
  }

  res.status(201).json({ success: true, data: review });
});

// POST /reviews/:reviewId/helpful
router.post('/:reviewId/helpful', protect, async (req, res, next) => {
  const review = await Review.findById(req.params.reviewId);
  if (!review) return next(new ErrorResponse('Review not found', 404));
  review.helpfulCount = (review.helpfulCount || 0) + 1;
  await review.save();
  res.status(200).json({ success: true, data: { helpfulCount: review.helpfulCount } });
});

// DELETE /reviews/:reviewId
router.delete('/:reviewId', protect, async (req, res, next) => {
  const review = await Review.findById(req.params.reviewId);
  if (!review) return next(new ErrorResponse('Review not found', 404));
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin')
    return next(new ErrorResponse('Not authorized', 403));
  await review.deleteOne();
  res.status(200).json({ success: true, message: 'Review deleted' });
});

module.exports = router;
