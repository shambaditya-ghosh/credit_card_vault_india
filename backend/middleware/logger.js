/**
 * CardVault India — Winston Logger Middleware
 *
 * Vercel serverless has a READ-ONLY filesystem at /var/task.
 * The only writable path is /tmp — and even that resets between invocations.
 * So in production/serverless we use Console-only transport.
 * File transports are only added when running locally (development).
 */

const { createLogger, format, transports } = require('winston');
const path = require('path');
const fs   = require('fs');

const { combine, timestamp, printf, colorize, errors, json } = format;

const IS_PROD       = process.env.NODE_ENV === 'production';
const IS_VERCEL     = !!process.env.VERCEL;           // Vercel sets this automatically
const USE_FILE_LOGS = !IS_PROD && !IS_VERCEL;          // only write files locally

// ── Formats ──────────────────────────────────────────────────────────────────
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

// ── Transports ────────────────────────────────────────────────────────────────
const activeTransports = [
  new transports.Console({
    format: IS_PROD ? prodFormat : devFormat,
  }),
];

// File transports — only in local development (never on Vercel)
if (USE_FILE_LOGS) {
  // /tmp is always writable; fall back if process.cwd() fails
  const logsDir = path.join('/tmp', 'cardvault-logs');
  try {
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
    activeTransports.push(
      new transports.File({
        filename: path.join(logsDir, 'error.log'),
        level:    'error',
        maxsize:  5 * 1024 * 1024, // 5 MB
        maxFiles: 5,
      }),
      new transports.File({
        filename: path.join(logsDir, 'app.log'),
        maxsize:  5 * 1024 * 1024,
        maxFiles: 10,
      })
    );
  } catch (e) {
    // If even /tmp fails (shouldn't happen locally), just keep console
    console.warn('[logger] Could not create log directory, using console only:', e.message);
  }
}

// ── Create logger ─────────────────────────────────────────────────────────────
const logger = createLogger({
  level:      process.env.LOG_LEVEL || 'info',
  format:     IS_PROD ? prodFormat : devFormat,
  transports: activeTransports,

  // Exception handler — console only on Vercel, file locally
  exceptionHandlers: USE_FILE_LOGS
    ? [new transports.File({ filename: path.join('/tmp', 'cardvault-logs', 'exceptions.log') })]
    : [new transports.Console()],

  exitOnError: false,
});

logger.info(`Logger initialised [env=${process.env.NODE_ENV || 'development'}, vercel=${IS_VERCEL}, fileLogs=${USE_FILE_LOGS}]`);

module.exports = logger;
