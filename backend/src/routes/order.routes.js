const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/order.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get ('/my-orders',              protect,                    ctrl.getMyOrders);
router.get ('/vendor/orders',          protect, authorize('vendor'), ctrl.getVendorOrders);
router.get ('/vendor/analytics',       protect, authorize('vendor'), ctrl.getVendorAnalytics);
router.get ('/:id',                    protect,                    ctrl.getOrder);
router.put ('/:id/cancel',             protect,                    ctrl.cancelOrder);
router.put ('/:id/vendor-update',      protect, authorize('vendor'), ctrl.updateOrderStatus);
router.post('/:id/create-shipment',    protect, authorize('vendor'), ctrl.createShipment);
router.get ('/:id/track',              protect,                    ctrl.trackOrder);

module.exports = router;
