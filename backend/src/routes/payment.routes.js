const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/payment.controller');
const { protect, authorize, requireVerified } = require('../middleware/auth.middleware');

router.post('/razorpay/create-order', protect, requireVerified, ctrl.createRazorpayOrder);
router.post('/razorpay/verify',       protect, ctrl.verifyRazorpayPayment);
router.post('/cod',                   protect, requireVerified, ctrl.createCODOrder);
router.post('/refund/:orderId',       protect, ctrl.requestRefund);
router.post('/refund/:orderId/approve', protect, authorize('admin'), ctrl.approveRefund);
// Raw body route (set in app.js before express.json)
router.post('/webhook/razorpay',              ctrl.razorpayWebhook);

module.exports = router;
