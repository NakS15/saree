const express  = require('express');
const router   = express.Router();
const Coupon   = require('../models/Coupon.model');
const { protect } = require('../middleware/auth.middleware');

// POST /coupons/validate
router.post('/validate', protect, async (req, res, next) => {
  const { code, orderAmount } = req.body;
  const coupon = await Coupon.findOne({ code: code?.toUpperCase() });
  if (!coupon) return next(require('../utils/errorResponse')('Invalid coupon code', 400));

  const result = coupon.isValid(req.user.id, orderAmount);
  if (!result.valid) return next(require('../utils/errorResponse')(result.message, 400));

  let discount = 0;
  if (coupon.type === 'percentage') discount = Math.min((coupon.value / 100) * orderAmount, coupon.maxDiscountAmount || Infinity);
  else if (coupon.type === 'fixed') discount = coupon.value;
  discount = Math.round(discount);

  res.status(200).json({ success: true, data: { coupon: { code: coupon.code, type: coupon.type, value: coupon.value, description: coupon.description }, discount } });
});

module.exports = router;
