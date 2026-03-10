/**
 * CardVault India — JWT Authentication Middleware
 */

const jwt    = require('jsonwebtoken');
const logger = require('./logger');
const { AppError } = require('./errorHandler');

// In-memory users store (replace with DB in production)
const users = new Map();

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('No authentication token provided', 401, 'NO_TOKEN'));
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_key_change_in_prod');

    req.user = decoded;
    next();
  } catch (err) {
    next(err);
  }
};

const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      req.user = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_key_change_in_prod');
    }
  } catch {
    // Silently ignore invalid token for optional auth
  }
  next();
};

const generateTokens = (payload) => {
  const access = jwt.sign(
    payload,
    process.env.JWT_SECRET || 'dev_secret_key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
  const refresh = jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );
  return { access, refresh };
};

module.exports = { authenticate, optionalAuth, generateTokens, users };
