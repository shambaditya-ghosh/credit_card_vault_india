/**
 * CardVault India — Rate Limiter Middleware
 */

const rateLimit = require('express-rate-limit');
const logger    = require('./logger');

// General API limiter
const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 min
  max:      parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    error: {
      code:    'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again after 15 minutes.',
    },
  },
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit exceeded: ${req.ip} — ${req.originalUrl}`);
    res.status(options.statusCode).json(options.message);
  },
});

// Stricter limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max:      10,
  message: {
    success: false,
    error: {
      code:    'AUTH_RATE_LIMIT',
      message: 'Too many authentication attempts. Please try again after 1 hour.',
    },
  },
});

// Application submission limiter
const applyLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max:      5,
  message: {
    success: false,
    error: {
      code:    'APPLICATION_LIMIT',
      message: 'Maximum 5 applications per day. Please try again tomorrow.',
    },
  },
});

module.exports = rateLimiter;
module.exports.authLimiter  = authLimiter;
module.exports.applyLimiter = applyLimiter;
