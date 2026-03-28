const express  = require('express');
const router   = express.Router();
const passport = require('passport');
const ctrl     = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { body }    = require('express-validator');
const { validate } = require('../middleware/validate.middleware');

const loginRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];
const registerRules = [
  body('name').trim().isLength({ min: 2 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
];

router.post('/register',        registerRules, validate, ctrl.register);
router.post('/login',           loginRules,    validate, ctrl.login);
router.post('/logout',          protect,               ctrl.logout);
router.post('/refresh-token',                          ctrl.refreshToken);
router.get ('/verify-email/:token',                    ctrl.verifyEmail);
router.post('/send-otp',                               ctrl.sendPhoneOTP);
router.post('/verify-otp',                             ctrl.verifyOTP);
router.post('/forgot-password',                        ctrl.forgotPassword);
router.put ('/reset-password/:token',                  ctrl.resetPassword);
router.get ('/me',              protect,               ctrl.getMe);

// Google OAuth
router.get('/google',           passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',  passport.authenticate('google', { session: false }), (req, res) => {
  const jwt        = require('jsonwebtoken');
  const token      = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
  res.redirect(`${process.env.CLIENT_URL}/auth/google/success?token=${token}`);
});

module.exports = router;
