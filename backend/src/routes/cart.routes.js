const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth.middleware');
const Cart    = require('../models/Cart.model');
const Product = require('../models/Product.model');
const Coupon  = require('../models/Coupon.model');
const ErrorResponse = require('../utils/errorResponse');

const MAX_QTY = 10;

// GET /cart
router.get('/', protect, async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id }).populate('items.product', 'name slug images price stock attributes vendor');
  res.status(200).json({ success: true, data: cart || { items: [], subtotal: 0 } });
});

// POST /cart/add
router.post('/add', protect, async (req, res, next) => {
  const { productId, color } = req.body;
  const quantity = req.body.quantity === undefined ? 1 : Number(req.body.quantity);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY) return next(new ErrorResponse(`Quantity must be between 1 and ${MAX_QTY}`, 400));

  const product = await Product.findById(productId);
  if (!product || product.status !== 'active') return next(new ErrorResponse('Product not available', 400));

  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) cart = new Cart({ user: req.user.id, items: [] });

  const idx = cart.items.findIndex((i) => i.product.toString() === String(productId) && i.color === color);
  const newQty = (idx > -1 ? cart.items[idx].quantity : 0) + quantity;
  if (newQty > MAX_QTY || product.stock < newQty) return next(new ErrorResponse('Insufficient stock', 400));

  if (idx > -1) cart.items[idx].quantity = newQty;
  else cart.items.push({ product: productId, quantity, price: product.price, color: typeof color === 'string' ? color : undefined });

  cart.subtotal = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
  await cart.save();
  await cart.populate('items.product', 'name slug images price stock attributes');
  res.status(200).json({ success: true, data: cart });
});

// PUT /cart/:itemId
router.put('/:itemId', protect, async (req, res, next) => {
  const quantity = Number(req.body.quantity);
  if (!Number.isInteger(quantity) || quantity > MAX_QTY) return next(new ErrorResponse(`Quantity must be a whole number up to ${MAX_QTY}`, 400));
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return next(new ErrorResponse('Cart not found', 404));

  const item = cart.items.id(req.params.itemId);
  if (!item) return next(new ErrorResponse('Item not found', 404));

  if (quantity <= 0) cart.items.pull({ _id: req.params.itemId });
  else {
    const product = await Product.findById(item.product);
    if (!product || product.stock < quantity) return next(new ErrorResponse('Insufficient stock', 400));
    item.quantity = quantity;
  }

  cart.subtotal = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
  await cart.save();
  res.status(200).json({ success: true, data: cart });
});

// DELETE /cart/:itemId
router.delete('/:itemId', protect, async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return next(new ErrorResponse('Cart not found', 404));
  cart.items.pull({ _id: req.params.itemId });
  cart.subtotal = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
  await cart.save();
  res.status(200).json({ success: true, data: cart });
});

// POST /cart/apply-coupon
router.post('/apply-coupon', protect, async (req, res, next) => {
  const { code } = req.body;
  const cart     = await Cart.findOne({ user: req.user.id });
  if (!cart) return next(new ErrorResponse('Cart not found', 404));

  const coupon = await Coupon.findOne({ code: code?.toUpperCase() });
  if (!coupon) return next(new ErrorResponse('Invalid coupon', 400));

  const validity = coupon.isValid(req.user.id, cart.subtotal);
  if (!validity.valid) return next(new ErrorResponse(validity.message, 400));

  let discount = 0;
  if (coupon.type === 'percentage') discount = Math.min((coupon.value / 100) * cart.subtotal, coupon.maxDiscountAmount || Infinity);
  else if (coupon.type === 'fixed') discount = coupon.value;

  cart.couponCode     = coupon.code;
  cart.couponDiscount = Math.round(discount);
  await cart.save();

  res.status(200).json({ success: true, data: { discount: cart.couponDiscount, code: coupon.code } });
});

// DELETE /cart/reset
router.delete('/', protect, async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user.id }, { items: [], subtotal: 0, couponCode: null, couponDiscount: 0 });
  res.status(200).json({ success: true, message: 'Cart cleared' });
});

module.exports = router;
