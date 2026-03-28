const express   = require('express');
const router    = express.Router();
const Wishlist  = require('../models/Wishlist.model');
const { protect } = require('../middleware/auth.middleware');

// GET /wishlist
router.get('/', protect, async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user.id }).populate('products', 'name slug images price compareAtPrice rating numReviews attributes');
  res.status(200).json({ success: true, data: wishlist?.products || [] });
});

// POST /wishlist/toggle
router.post('/toggle', protect, async (req, res, next) => {
  const { productId } = req.body;
  let wishlist = await Wishlist.findOne({ user: req.user.id });
  if (!wishlist) wishlist = new Wishlist({ user: req.user.id, products: [] });

  const idx   = wishlist.products.indexOf(productId);
  const added = idx === -1;
  if (added) wishlist.products.push(productId);
  else       wishlist.products.splice(idx, 1);
  await wishlist.save();

  res.status(200).json({ success: true, added, data: wishlist.products });
});

module.exports = router;
