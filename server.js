/**
 * CardVault India — Main Server Entry Point
 * Node.js + Express REST API
 */

require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const compression  = require('compression');
const morgan       = require('morgan');
const cookieParser = require('cookie-parser');
const path         = require('path');

const logger       = require('./backend/middleware/logger');
const errorHandler = require('./backend/middleware/errorHandler');
const rateLimiter  = require('./backend/middleware/rateLimiter');
const { notFound } = require('./backend/middleware/notFound');

// Route imports
const cardRoutes        = require('./backend/routes/cards');
const bankRoutes        = require('./backend/routes/banks');
const categoryRoutes    = require('./backend/routes/categories');
const comparisonRoutes  = require('./backend/routes/comparison');
const applicationRoutes = require('./backend/routes/applications');
const authRoutes        = require('./backend/routes/auth');
const loungeRoutes      = require('./backend/routes/lounges');
const searchRoutes      = require('./backend/routes/search');
const rewardRoutes      = require('./backend/routes/rewards');
const eligibilityRoutes = require('./backend/routes/eligibility');

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── Security Middleware ────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      fontSrc:    ["'self'", "fonts.gstatic.com"],
      scriptSrc:  ["'self'"],
      imgSrc:     ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// ─── CORS ───────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS policy blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
}));

// ─── General Middleware ──────────────────────────────────────────────────────
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(morgan('combined', { stream: { write: msg => logger.info(msg.trim()) } }));

// ─── Rate Limiting ───────────────────────────────────────────────────────────
app.use('/api/', rateLimiter);

// ─── Static Frontend ─────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'frontend/public')));

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    status:    'ok',
    service:   'CardVault India API',
    version:   '1.0.0',
    timestamp: new Date().toISOString(),
    uptime:    `${Math.floor(process.uptime())}s`,
    environment: process.env.NODE_ENV || 'development',
  });
});

// ─── API Routes ──────────────────────────────────────────────────────────────
const API = '/api/v1';
app.use(`${API}/cards`,        cardRoutes);
app.use(`${API}/banks`,        bankRoutes);
app.use(`${API}/categories`,   categoryRoutes);
app.use(`${API}/compare`,      comparisonRoutes);
app.use(`${API}/applications`, applicationRoutes);
app.use(`${API}/auth`,         authRoutes);
app.use(`${API}/lounges`,      loungeRoutes);
app.use(`${API}/search`,       searchRoutes);
app.use(`${API}/rewards`,      rewardRoutes);
app.use(`${API}/eligibility`,  eligibilityRoutes);

// ─── API Root Info ────────────────────────────────────────────────────────────
app.get(`${API}`, (req, res) => {
  res.json({
    message: '💳 Welcome to CardVault India API',
    version: 'v1',
    docs:    `${process.env.APP_URL || 'http://localhost:' + PORT}/api/v1/docs`,
    endpoints: {
      cards:        `${API}/cards`,
      banks:        `${API}/banks`,
      categories:   `${API}/categories`,
      compare:      `${API}/compare`,
      applications: `${API}/applications`,
      auth:         `${API}/auth`,
      lounges:      `${API}/lounges`,
      search:       `${API}/search`,
      rewards:      `${API}/rewards`,
      eligibility:  `${API}/eligibility`,
    },
  });
});

// ─── SPA Fallback ─────────────────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/public', 'index.html'));
});

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  logger.info(`✅  CardVault India API running on port ${PORT}`);
  logger.info(`🌐  Environment : ${process.env.NODE_ENV || 'development'}`);
  logger.info(`📡  API Base    : http://localhost:${PORT}/api/v1`);
  logger.info(`❤️   Health     : http://localhost:${PORT}/health`);
});

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
const shutdown = (signal) => {
  logger.info(`${signal} received — shutting down gracefully`);
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
process.on('uncaughtException',  err => { logger.error('Uncaught Exception:', err);  process.exit(1); });
process.on('unhandledRejection', err => { logger.error('Unhandled Rejection:', err); process.exit(1); });

module.exports = app;
