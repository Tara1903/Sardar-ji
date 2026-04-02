const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { env } = require('./config/env');
const { errorHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const productRoutes = require('./routes/productRoutes');
const referralRoutes = require('./routes/referralRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const trackingRoutes = require('./routes/trackingRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();

const originCandidates = [
  env.clientOrigin,
  ...env.allowedOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
].filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) {
    return true;
  }

  if (originCandidates.includes(origin)) {
    return true;
  }

  // Allow Vercel preview URLs and localhost during development/testing.
  if (/^https:\/\/.*\.vercel\.app$/i.test(origin) || /^http:\/\/localhost(?::\d+)?$/i.test(origin)) {
    return true;
  }

  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Origin not allowed by CORS.'));
    },
    credentials: true,
  }),
);
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan('dev'));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

app.get('/api/health', (_req, res) => {
  res.json({
    name: 'Sardar Ji Food Corner API',
    status: 'ok',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/referral', referralRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/settings', settingsRoutes);

app.use(errorHandler);

module.exports = { app };
