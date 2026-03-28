const express   = require('express');
const router    = express.Router();
const Category  = require('../models/Category.model');

router.get('/', async (req, res) => {
  const cats = await Category.find({ isActive: true }).sort('order name');
  res.status(200).json({ success: true, data: cats });
});

router.get('/tree', async (req, res) => {
  const cats     = await Category.find({ isActive: true, parent: null }).sort('order name');
  const children = await Category.find({ isActive: true, parent: { $ne: null } }).sort('order name');
  const tree     = cats.map((c) => ({
    ...c.toObject(),
    children: children.filter((ch) => ch.parent?.toString() === c._id.toString()),
  }));
  res.status(200).json({ success: true, data: tree });
});

router.get('/:slug', async (req, res, next) => {
  const cat = await Category.findOne({ slug: req.params.slug, isActive: true });
  if (!cat) return next(require('../utils/errorResponse')('Category not found', 404));
  res.status(200).json({ success: true, data: cat });
});

module.exports = router;
