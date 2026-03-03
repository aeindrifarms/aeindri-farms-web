// ═══════════════════════════════════════════════
//  AEINDRI FARMS — Main Server Entry Point
//  server.js
// ═══════════════════════════════════════════════

const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');
require('dotenv').config();

const app = express();

// ── SECURITY MIDDLEWARE ──────────────────────
app.use(helmet());
app.use(cors({
  origin: [process.env.CLIENT_URL || 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}));

// ── RATE LIMITING ────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many auth attempts. Please try again later.' },
});
app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

// ── BODY PARSING ─────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── LOGGING ──────────────────────────────────
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// ── DATABASE CONNECTION ──────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected — Aeindri Farms DB'))
  .catch(err => { console.error('❌ MongoDB connection error:', err); process.exit(1); });

// ── API ROUTES ───────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/cart',     require('./routes/cart'));
app.use('/api/orders',   require('./routes/orders'));
app.use('/api/users',    require('./routes/users'));
app.use('/api/reviews',  require('./routes/reviews'));
app.use('/api/admin',    require('./routes/admin'));

// ── HEALTH CHECK ─────────────────────────────
app.get('/api/health', (req, res) => res.json({
  success: true,
  message: '🌿 Aeindri Farms API is running',
  version: '1.0.0',
  timestamp: new Date().toISOString(),
}));

// ── 404 HANDLER ──────────────────────────────
app.use((req, res) => res.status(404).json({
  success: false,
  message: `Route ${req.originalUrl} not found`,
}));

// ── GLOBAL ERROR HANDLER ─────────────────────
app.use((err, req, res, next) => {
  console.error('🔴 Error:', err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ── START SERVER ─────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🌿 Aeindri Farms API`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 Environment: ${process.env.NODE_ENV}\n`);
});

module.exports = app;
