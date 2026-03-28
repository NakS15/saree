const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect, authorize('admin'));

router.get('/analytics', ctrl.getAnalytics);

router.get('/users', ctrl.getUsers);
router.put('/users/:id/toggle-status', ctrl.toggleUserStatus);

router.get('/vendors', ctrl.getVendors);
router.put('/vendors/:id/review', ctrl.reviewVendor);

router.get('/products/pending', ctrl.getPendingProducts);
router.put('/products/:id/review', ctrl.reviewProduct);

router.get('/orders', ctrl.getAllOrders);

router.get('/categories', ctrl.getCategories);
router.post('/categories', ctrl.createCategory);
router.put('/categories/:id', ctrl.updateCategory);
router.delete('/categories/:id', ctrl.deleteCategory);

router.get('/coupons', ctrl.getCoupons);
router.post('/coupons', ctrl.createCoupon);
router.delete('/coupons/:id', ctrl.deleteCoupon);

module.exports = router;
