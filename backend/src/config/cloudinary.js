const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const cloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'REPLACE_WITH_YOUR_CLOUD_NAME';

if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// ─── Fallback: local disk storage when Cloudinary not configured ───────────────
const localUploadDir = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(localUploadDir)) fs.mkdirSync(localUploadDir, { recursive: true });

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, localUploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`),
});

let productStorage, avatarStorage, docStorage;

if (cloudinaryConfigured) {
  const { CloudinaryStorage } = require('multer-storage-cloudinary');
  productStorage = new CloudinaryStorage({
    cloudinary,
    params: { folder: 'sareebazaar/products', allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 1200, height: 1600, crop: 'limit', quality: 'auto:good' }] },
  });
  avatarStorage = new CloudinaryStorage({
    cloudinary,
    params: { folder: 'sareebazaar/avatars', allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto' }] },
  });
  docStorage = new CloudinaryStorage({
    cloudinary,
    params: { folder: 'sareebazaar/kyc', allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'], resource_type: 'auto' },
  });
} else {
  productStorage = diskStorage;
  avatarStorage = diskStorage;
  docStorage = diskStorage;
}

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') cb(null, true);
  else cb(new Error('Only images and PDFs are allowed'), false);
};

// ─── Middleware to normalise local vs cloudinary file response ─────────────────
const normalisePath = (req, res, next) => {
  if (req.file && !cloudinaryConfigured) req.file.path = `/uploads/${req.file.filename}`;
  if (req.files && !cloudinaryConfigured) req.files = req.files.map((f) => ({ ...f, path: `/uploads/${f.filename}` }));
  next();
};

exports.upload = multer({ storage: productStorage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
exports.uploadAvatar = multer({ storage: avatarStorage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } });
exports.uploadDoc = multer({ storage: docStorage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
exports.normalisePath = normalisePath;
exports.cloudinary = cloudinary;
exports.cloudinaryConfigured = cloudinaryConfigured;
