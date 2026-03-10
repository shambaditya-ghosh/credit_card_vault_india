const express  = require('express');
const { body } = require('express-validator');
const router   = express.Router();
const { checkEligibility } = require('../controllers/eligibilityController');

router.post('/', [
  body('monthlyIncome').isInt({ min: 0 }).withMessage('Monthly income must be a positive number'),
  body('employmentType').isIn(['salaried', 'self_employed', 'business', 'freelancer']),
  body('cibilScore').optional().isInt({ min: 300, max: 900 }),
  body('preferredCategory').optional().isString(),
  body('monthlySpend').optional().isInt({ min: 0 }),
], checkEligibility);

module.exports = router;
