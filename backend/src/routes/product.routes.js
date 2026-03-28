const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/product.controller');
const { protect, authorize, optionalAuth } = require('../middleware/auth.middleware');

router.get('/featured',                 ctrl.getFeatured);
router.get('/trending',                 ctrl.getTrending);
router.get('/search/autocomplete',      ctrl.searchAutocomplete);
router.get('/vendor/my-products', protect, authorize('vendor'), ctrl.getMyProducts);
router.get('/',                  optionalAuth, ctrl.getProducts);
router.get('/:slug',             optionalAuth, ctrl.getProduct);
router.post('/',     protect, authorize('vendor'), ctrl.createProduct);
router.put('/:id',   protect, authorize('vendor'), ctrl.updateProduct);
router.delete('/:id',protect, authorize('vendor'), ctrl.deleteProduct);

module.exports = router;
