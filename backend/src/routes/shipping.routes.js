const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');

// POST /shipping/calculate
router.post('/calculate', protect, async (req, res) => {
  const { pincode, weight = 500, subtotal = 0 } = req.body;

  // Basic rule-based calculation (replace with Shiprocket API if needed)
  const isFreeShipping = subtotal >= 999;
  const standard = isFreeShipping ? 0 : 99;
  const express_ = 199;

  res.status(200).json({
    success: true,
    data: {
      standard: { label: 'Standard Delivery', days: '5-7 business days', charge: standard },
      express: { label: 'Express Delivery', days: '2-3 business days', charge: express_ },
      freeShippingEligible: isFreeShipping,
    },
  });
});

module.exports = router;
