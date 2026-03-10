// ──────────────── auth.js ────────────────
const express  = require('express');
const { body } = require('express-validator');
const router   = express.Router();
const { register, login, getProfile, logout } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { authLimiter }  = require('../middleware/rateLimiter');

router.post('/register', authLimiter, [
  body('firstName').trim().notEmpty().isLength({ min: 2 }),
  body('lastName').trim().notEmpty().isLength({ min: 2 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('mobile').matches(/^[6-9]\d{9}$/),
], register);

router.post('/login', authLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], login);

router.get('/profile', authenticate, getProfile);
router.post('/logout', authenticate, logout);

module.exports = router;
