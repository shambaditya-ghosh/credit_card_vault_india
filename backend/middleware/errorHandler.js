/**
 * CardVault India — Global Error Handler Middleware
 */

const logger = require('./logger');

class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code       = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message    = err.message    || 'Internal Server Error';

  // Express-Validator errors
  if (err.type === 'validation') {
    statusCode = 422;
    message    = 'Validation Error';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message    = 'Invalid token. Please log in again.';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message    = 'Token has expired. Please log in again.';
  }

  // Log in production; full stack in development
  if (process.env.NODE_ENV === 'production') {
    if (!err.isOperational) logger.error(`[500] ${err.stack}`);
  } else {
    logger.error(`[${statusCode}] ${err.stack || message}`);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code:    err.code    || `ERR_${statusCode}`,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  });
};

module.exports = errorHandler;
module.exports.AppError = AppError;
