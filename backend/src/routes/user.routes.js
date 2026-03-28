const express  = require('express');
const router   = express.Router();
const User     = require('../models/User.model');
const { protect } = require('../middleware/auth.middleware');
const ErrorResponse = require('../utils/errorResponse');

// GET /users/profile
router.get('/profile', protect, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password -refreshToken');
  res.status(200).json({ success: true, data: user });
});

// PUT /users/profile
router.put('/profile', protect, async (req, res) => {
  const allowed = ['name', 'phone', 'avatar', 'preferences'];
  const update  = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
  const user    = await User.findByIdAndUpdate(req.user.id, update, { new: true, runValidators: true }).select('-password');
  res.status(200).json({ success: true, data: user });
});

// PUT /users/change-password
router.put('/change-password', protect, async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.matchPassword(req.body.currentPassword)))
    return next(new ErrorResponse('Current password is incorrect', 401));
  user.password = req.body.newPassword;
  await user.save();
  res.status(200).json({ success: true, message: 'Password updated' });
});

// GET /users/addresses
router.get('/addresses', protect, async (req, res) => {
  const user = await User.findById(req.user.id).select('addresses');
  res.status(200).json({ success: true, data: user.addresses });
});

// POST /users/addresses
router.post('/addresses', protect, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (req.body.isDefault) user.addresses.forEach((a) => (a.isDefault = false));
  user.addresses.push(req.body);
  await user.save();
  res.status(201).json({ success: true, data: user.addresses });
});

// DELETE /users/addresses/:addrId
router.delete('/addresses/:addrId', protect, async (req, res) => {
  const user = await User.findById(req.user.id);
  user.addresses.pull({ _id: req.params.addrId });
  await user.save();
  res.status(200).json({ success: true, data: user.addresses });
});

module.exports = router;
