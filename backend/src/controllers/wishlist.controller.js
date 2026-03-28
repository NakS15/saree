const User = require('../models/User.model');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get wishlist
// @route   GET /api/v1/wishlist
// @access  Private
exports.getWishlist = async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate('wishlist', 'name price images rating slug compareAtPrice attributes vendor');
  res.status(200).json({ success: true, data: user.wishlist });
};

// @desc    Add to wishlist
// @route   POST /api/v1/wishlist/:productId
// @access  Private
exports.addToWishlist = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (user.wishlist.includes(req.params.productId)) {
    return res.status(200).json({ success: true, message: 'Already in wishlist', data: user.wishlist });
  }
  user.wishlist.push(req.params.productId);
  await user.save({ validateBeforeSave: false });
  res.status(200).json({ success: true, message: 'Added to wishlist', data: user.wishlist });
};

// @desc    Remove from wishlist
// @route   DELETE /api/v1/wishlist/:productId
// @access  Private
exports.removeFromWishlist = async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { $pull: { wishlist: req.params.productId } });
  res.status(200).json({ success: true, message: 'Removed from wishlist' });
};
