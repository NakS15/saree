const { body, validationResult } = require('express-validator');
const ErrorResponse = require('../utils/errorResponse');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array().map((e) => e.msg).join('. '),
      errors:  errors.array(),
    });
  }
  next();
};

exports.validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  validate,
];

exports.validateLogin = [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

exports.validateProduct = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price required'),
  body('stock').isInt({ min: 0 }).withMessage('Valid stock required'),
  body('category').isMongoId().withMessage('Valid category required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  validate,
];

exports.validateReview = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').trim().isLength({ min: 10, max: 1000 }).withMessage('Comment must be 10-1000 characters'),
  validate,
];

exports.validateAddress = [
  body('fullName').trim().notEmpty().withMessage('Full name required'),
  body('phone').matches(/^[6-9]\d{9}$/).withMessage('Valid Indian phone number required'),
  body('pincode').matches(/^\d{6}$/).withMessage('Valid 6-digit pincode required'),
  body('addressLine1').trim().notEmpty().withMessage('Address line 1 required'),
  body('city').trim().notEmpty().withMessage('City required'),
  body('state').trim().notEmpty().withMessage('State required'),
  validate,
];
