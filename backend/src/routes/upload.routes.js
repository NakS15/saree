const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { upload, uploadAvatar, uploadDoc } = require('../config/cloudinary');

// ─── POST /upload/products ────────────────────────────────────────────────────
router.post('/products', protect, upload.array('images', 10), (req, res) => {
  const files = req.files.map((f) => ({ url: f.path, publicId: f.filename, alt: '' }));
  res.status(200).json({ success: true, data: files });
});

// ─── POST /upload/avatar ──────────────────────────────────────────────────────
router.post('/avatar', protect, uploadAvatar.single('avatar'), (req, res) => {
  res.status(200).json({ success: true, data: { url: req.file.path, publicId: req.file.filename } });
});

// ─── POST /upload/kyc-document ────────────────────────────────────────────────
router.post('/kyc-document', protect, uploadDoc.single('document'), (req, res) => {
  res.status(200).json({ success: true, data: { url: req.file.path, publicId: req.file.filename } });
});

module.exports = router;
