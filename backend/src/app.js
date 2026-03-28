console.log('app.js starting...');
require('dotenv').config();
require('express-async-errors');
const express        = require('express');
const mongoose       = require('mongoose');
const cors           = require('cors');
const helmet         = require('helmet');
const morgan         = require('morgan');
const cookieParser   = require('cookie-parser');
const compression    = require('compression');
const rateLimit      = require('express-rate-limit');
const mongoSanitize  = require('express-mongo-sanitize');
const xssClean       = require('xss-clean');
const hpp            = require('hpp');
const passport       = require('passport');
const session        = require('express-session');
const MemoryStore    = require('memorystore')(session);
const logger         = require('./config/logger');
const errorHandler   = require('./middleware/errorHandler');
console.log('Core modules loaded');

const authRoutes     = require('./routes/auth.routes');
console.log('auth ok');
const userRoutes     = require('./routes/user.routes');
console.log('user ok');
const vendorRoutes   = require('./routes/vendor.routes');
console.log('vendor ok');
const productRoutes  = require('./routes/product.routes');
console.log('product ok');
const orderRoutes    = require('./routes/order.routes');
console.log('order ok');
const paymentRoutes  = require('./routes/payment.routes');
console.log('payment ok');
const reviewRoutes   = require('./routes/review.routes');
console.log('review ok');
const categoryRoutes = require('./routes/category.routes');
console.log('category ok');
const cartRoutes     = require('./routes/cart.routes');
console.log('cart ok');
const wishlistRoutes = require('./routes/wishlist.routes');
console.log('wishlist ok');
const shippingRoutes = require('./routes/shipping.routes');
console.log('shipping ok');
const uploadRoutes   = require('./routes/upload.routes');
console.log('upload ok');
const couponRoutes   = require('./routes/coupon.routes');
console.log('coupon ok');
const adminRoutes    = require('./routes/admin.routes');
console.log('admin ok');

const app = express();

app.use(helmet());
app.use(mongoSanitize());
app.use(xssClean());
app.use(hpp({ whitelist: ['sort', 'fields', 'fabric', 'occasion', 'colors'] }));
console.log('Security ok');

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max:      parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message:  { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders:   false,
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts, please try again in 15 minutes.' },
});
app.use('/api/v1/auth/login',    authLimiter);
app.use('/api/v1/auth/register', authLimiter);
console.log('Rate limiting ok');

app.use(cors({
  origin: (origin, cb) => {
    const allowed = [process.env.CLIENT_URL, 'http://localhost:3000'].filter(Boolean);
    if (!origin || allowed.includes(origin)) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
console.log('CORS ok');

app.use('/api/v1/payments/webhook/razorpay', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression());
console.log('Body parsing ok');

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
}
console.log('Logging ok');

app.use(session({
  secret:            process.env.SESSION_SECRET || 'sareebazaar-session',
  resave:            false,
  saveUninitialized: false,
  store:             new MemoryStore({ checkPeriod: 86400000 }),
  cookie:            { secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 },
}));
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport');
console.log('Session and passport ok');

app.get('/health', (req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV, timestamp: new Date().toISOString() }));

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

const API = '/api/v1';
app.use(`${API}/auth`,       authRoutes);
app.use(`${API}/users`,      userRoutes);
app.use(`${API}/vendors`,    vendorRoutes);
app.use(`${API}/products`,   productRoutes);
app.use(`${API}/orders`,     orderRoutes);
app.use(`${API}/payments`,   paymentRoutes);
app.use(`${API}/reviews`,    reviewRoutes);
app.use(`${API}/categories`, categoryRoutes);
app.use(`${API}/cart`,       cartRoutes);
app.use(`${API}/wishlist`,   wishlistRoutes);
app.use(`${API}/shipping`,   shippingRoutes);
app.use(`${API}/upload`,     uploadRoutes);
app.use(`${API}/coupons`,    couponRoutes);
app.use(`${API}/admin`,      adminRoutes);
console.log('Routes ok');

app.use('*', (req, res) => res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` }));
app.use(errorHandler);

console.log('app.js fully loaded');
module.exports = app;