const Cart = require('../models/Cart.model');
const Product = require('../models/Product.model');
const Coupon = require('../models/Coupon.model');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get cart
// @route   GET /api/v1/cart
// @access  Private
exports.getCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id })
    .populate('items.product', 'name images price stock status slug attributes vendor');

  if (!cart) return res.status(200).json({ success: true, data: { items: [], subtotal: 0, totalItems: 0 } });
  res.status(200).json({ success: true, data: cart });
};

// @desc    Add to cart
// @route   POST /api/v1/cart
// @access  Private
exports.addToCart = async (req, res) => {
  const { productId, quantity = 1, color } = req.body;

  const product = await Product.findOne({ _id: productId, status: 'active' });
  if (!product) throw new ErrorResponse('Product not available', 404);
  if (product.stock < quantity) throw new ErrorResponse('Insufficient stock', 400);

  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) cart = await Cart.create({ user: req.user.id, items: [] });

  const existingItemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId && item.color === color
  );

  if (existingItemIndex > -1) {
    const newQty = cart.items[existingItemIndex].quantity + quantity;
    if (newQty > product.stock) throw new ErrorResponse('Cannot add more than available stock', 400);
    cart.items[existingItemIndex].quantity = newQty;
  } else {
    cart.items.push({ product: productId, quantity, color, price: product.price });
  }

  await cart.save();
  const populatedCart = await Cart.findById(cart._id).populate('items.product', 'name images price stock slug');
  res.status(200).json({ success: true, message: 'Added to cart', data: populatedCart });
};

// @desc    Update cart item quantity
// @route   PUT /api/v1/cart/:itemId
// @access  Private
exports.updateCartItem = async (req, res) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) throw new ErrorResponse('Cart not found', 404);

  const item = cart.items.id(req.params.itemId);
  if (!item) throw new ErrorResponse('Item not found in cart', 404);

  const product = await Product.findById(item.product);
  if (quantity > product.stock) throw new ErrorResponse('Insufficient stock', 400);

  if (quantity <= 0) {
    cart.items.pull(req.params.itemId);
  } else {
    item.quantity = quantity;
  }

  await cart.save();
  res.status(200).json({ success: true, data: cart });
};

// @desc    Remove item from cart
// @route   DELETE /api/v1/cart/:itemId
// @access  Private
exports.removeFromCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) throw new ErrorResponse('Cart not found', 404);
  cart.items.pull(req.params.itemId);
  await cart.save();
  res.status(200).json({ success: true, message: 'Item removed', data: cart });
};

// @desc    Apply coupon
// @route   POST /api/v1/cart/apply-coupon
// @access  Private
exports.applyCoupon = async (req, res) => {
  const { code } = req.body;
  const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
  if (!cart) throw new ErrorResponse('Cart not found', 404);

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon) throw new ErrorResponse('Invalid coupon code', 404);

  const subtotal = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const validity = coupon.isValid(req.user.id, subtotal);
  if (!validity.valid) throw new ErrorResponse(validity.message, 400);

  let discount = 0;
  if (coupon.type === 'percentage') discount = Math.min((coupon.value / 100) * subtotal, coupon.maxDiscountAmount || Infinity);
  else if (coupon.type === 'fixed') discount = coupon.value;

  cart.couponCode = coupon.code;
  cart.couponDiscount = Math.round(discount);
  await cart.save();

  res.status(200).json({ success: true, message: `Coupon applied! You save ₹${Math.round(discount)}`, data: cart });
};

// @desc    Clear cart
// @route   DELETE /api/v1/cart
// @access  Private
exports.clearCart = async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user.id }, { items: [], couponCode: null, couponDiscount: 0 });
  res.status(200).json({ success: true, message: 'Cart cleared' });
};
