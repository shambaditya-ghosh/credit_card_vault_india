/**
 * CardVault India — Auth Controller
 */
const bcrypt   = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const { generateTokens, users } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../middleware/logger');

const register = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, error: { code: 'VALIDATION_ERROR', details: errors.array() } });
  }

  try {
    const { firstName, lastName, email, password, mobile } = req.body;

    if (Array.from(users.values()).find(u => u.email === email.toLowerCase())) {
      return next(new AppError('Email already registered', 409, 'EMAIL_EXISTS'));
    }

    const hashed = await bcrypt.hash(password, 12);
    const userId = uuidv4();
    const user = {
      id: userId, firstName, lastName,
      email: email.toLowerCase(),
      mobile, password: hashed,
      role: 'user', createdAt: new Date().toISOString(),
      savedCards: [], profile: {},
    };

    users.set(userId, user);
    const { access, refresh } = generateTokens({ id: userId, email: user.email, role: user.role });

    logger.info(`New user registered: ${email}`);
    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      data: { user: { id: userId, firstName, lastName, email: user.email, role: user.role }, token: access, refreshToken: refresh },
    });
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, error: { code: 'VALIDATION_ERROR', details: errors.array() } });
  }

  try {
    const { email, password } = req.body;
    const user = Array.from(users.values()).find(u => u.email === email.toLowerCase());

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS'));
    }

    const { access, refresh } = generateTokens({ id: user.id, email: user.email, role: user.role });
    res.cookie('refreshToken', refresh, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 30 * 24 * 60 * 60 * 1000, sameSite: 'strict' });

    res.json({
      success: true,
      data: { user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role }, token: access },
    });
  } catch (err) { next(err); }
};

const getProfile = (req, res, next) => {
  const user = users.get(req.user.id);
  if (!user) return next(new AppError('User not found', 404));
  const { password: _, ...safeUser } = user;
  res.json({ success: true, data: safeUser });
};

const logout = (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out successfully' });
};

module.exports = { register, login, getProfile, logout };
