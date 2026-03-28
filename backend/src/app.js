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

// Route imports
const authRoutes     = require('./routes/auth.routes');
const userRoutes     = require('./routes/user.routes');
const vendorRoutes   = require('./routes/vendor.routes');
const productRoutes  = require('./routes/product.routes');
const orderRoutes    = require('./routes/order.routes');
const paymentRoutes  = require('./routes/payment.routes');
const reviewRoutes   = require('./routes/review.routes');
const categoryRoutes = require('./routes/category.routes');
const cartRoutes     = require('./routes/cart.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const shippingRoutes = require('./routes/shipping.routes');
const uploadRoutes   = require('./routes/upload.routes');
const couponRoutes   = require('./routes/coupon.routes');
const adminRoutes    = require('./routes/admin.routes');

const app = express();

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet());
app.use(mongoSanitize());
app.use(xssClean());
app.use(hpp({ whitelist: ['sort', 'fields', 'fabric', 'occasion', 'colors'] }));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
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

// ─── CORS ─────────────────────────────────────────────────────────────────────
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

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use('/api/v1/payments/webhook/razorpay', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression());

// ─── Logging ──────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
}

// ─── Passport / Session ───────────────────────────────────────────────────────
app.use(session({
  secret:            process.env.SESSION_SECRET || 'sareebazaar-session',
  resave:            false,
  saveUninitialized: false,
  store:             new MemoryStore({ checkPeriod: 86400000 }),
  cookie:            { secure: false, maxAge: 24 * 60 * 60 * 1000 },
}));
app.use(passport.initialize());
app.use(passport.session());

// Only load Google OAuth if credentials are configured
if (
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_ID !== 'REPLACE_WITH_YOUR_GOOGLE_CLIENT_ID'
) {
  require('./config/passport');
} else {
  logger.info('Google OAuth not configured — skipping passport strategy');
}

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV, timestamp: new Date().toISOString() }));

// ─── Serve local uploads ──────────────────────────────────────────────────────
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// ─── API Routes ───────────────────────────────────────────────────────────────
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

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use('*', (req, res) => res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` }));

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;