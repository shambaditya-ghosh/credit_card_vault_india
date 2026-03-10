/**
 * CardVault India — Winston Logger Middleware
 */

const { createLogger, format, transports } = require('winston');
const path = require('path');
const fs   = require('fs');

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

const { combine, timestamp, printf, colorize, errors, json } = format;

const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack }) =>
    `${timestamp} [${level}] ${stack || message}`
  )
);

const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
  transports: [
    new transports.Console(),
    new transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880,  // 5MB
      maxFiles: 5,
    }),
    new transports.File({
      filename: path.join(logsDir, 'app.log'),
      maxsize: 5242880,
      maxFiles: 10,
    }),
  ],
  exceptionHandlers: [
    new transports.File({ filename: path.join(logsDir, 'exceptions.log') }),
  ],
});

module.exports = logger;
