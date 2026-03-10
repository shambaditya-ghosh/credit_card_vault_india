const express = require('express');
const { body } = require('express-validator');
const router   = express.Router();
const { submitApplication, getApplication, getAllApplications } = require('../controllers/applicationsController');
const { authenticate } = require('../middleware/auth');
const { applyLimiter } = require('../middleware/rateLimiter');

const applicationValidation = [
  body('firstName').trim().notEmpty().withMessage('First name is required').isLength({ min: 2, max: 50 }),
  body('lastName').trim().notEmpty().withMessage('Last name is required').isLength({ min: 2, max: 50 }),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('mobile').matches(/^[6-9]\d{9}$/).withMessage('Valid 10-digit Indian mobile number required'),
  body('panCard').matches(/^[A-Z]{5}[0-9]{4}[A-Z]$/).withMessage('Valid PAN card number required (e.g. ABCDE1234F)'),
  body('monthlyIncome').isInt({ min: 0 }).withMessage('Monthly income must be a positive number'),
  body('employmentType').isIn(['salaried', 'self_employed', 'business', 'freelancer']).withMessage('Invalid employment type'),
  body('cardId').notEmpty().withMessage('Card ID is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('monthlySpend').optional().isInt({ min: 0 }),
];

router.post('/', applyLimiter, applicationValidation, submitApplication);
router.get('/:id', getApplication);
router.get('/', authenticate, getAllApplications); // Admin only

module.exports = router;
