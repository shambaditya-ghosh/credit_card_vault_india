/**
 * CardVault India — Applications Controller
 * Handles credit card applications & eligibility pre-check
 */

const { v4: uuidv4 }   = require('uuid');
const { validationResult } = require('express-validator');
const CARDS = require('../data/cards');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../middleware/logger');

// In-memory store (replace with DB)
const applications = new Map();

// ─── POST /applications ───────────────────────────────────────────────────────
const submitApplication = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid application data', details: errors.array() },
    });
  }

  const {
    firstName, lastName, email, mobile,
    panCard, dob, employmentType,
    monthlyIncome, city, cardId,
    monthlySpend, preferredCategory,
  } = req.body;

  // Find card
  const card = CARDS.find(c => c.id === cardId || c.slug === cardId);
  if (!card) return next(new AppError('Card not found', 404, 'CARD_NOT_FOUND'));

  // Basic eligibility check
  const annualIncome   = monthlyIncome * 12;
  const eligibilityCheck = checkEligibility(card, monthlyIncome, employmentType);

  const appId = `CVA-${Date.now()}-${uuidv4().slice(0, 8).toUpperCase()}`;

  const application = {
    id:           appId,
    cardId:       card.id,
    cardName:     card.name,
    bank:         card.bank,
    status:       eligibilityCheck.eligible ? 'under_review' : 'pre_rejected',
    eligibility:  eligibilityCheck,
    applicant: {
      firstName, lastName, email,
      mobile: mobile.replace(/\D/g, '').slice(-10),
      panCard: panCard.toUpperCase(),
      dob, city, employmentType,
    },
    financials: { monthlyIncome, annualIncome, monthlySpend, preferredCategory },
    submittedAt:  new Date().toISOString(),
    updatedAt:    new Date().toISOString(),
    estimatedDecision: eligibilityCheck.eligible ? '3–7 business days' : 'Application rejected',
    referenceNote: eligibilityCheck.eligible
      ? 'Your application is under review. You will receive an SMS/email update within 3–7 business days.'
      : `Pre-rejection: ${eligibilityCheck.reasons.join('; ')}`,
  };

  applications.set(appId, application);
  logger.info(`New application: ${appId} for ${card.name} by ${email}`);

  res.status(201).json({
    success:     true,
    data:        application,
    message:     eligibilityCheck.eligible
      ? '✅ Application submitted successfully! You will hear from us in 3–7 business days.'
      : '❌ Your profile does not meet the minimum eligibility criteria for this card.',
  });
};

// ─── GET /applications/:id ────────────────────────────────────────────────────
const getApplication = (req, res, next) => {
  const app = applications.get(req.params.id);
  if (!app) return next(new AppError('Application not found', 404, 'APP_NOT_FOUND'));
  res.json({ success: true, data: app });
};

// ─── GET /applications (admin) ────────────────────────────────────────────────
const getAllApplications = (req, res) => {
  const data = Array.from(applications.values())
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  res.json({ success: true, data, count: data.length });
};

// ─── Helper: eligibility check ────────────────────────────────────────────────
const checkEligibility = (card, monthlyIncome, employmentType) => {
  const reasons  = [];
  const warnings = [];

  const minIncome = employmentType === 'salaried'
    ? card.eligibility.minMonthlyIncomeSalaried
    : card.eligibility.minMonthlyIncomeSelfEmployed;

  if (monthlyIncome < minIncome) {
    reasons.push(`Minimum monthly income required: ₹${minIncome.toLocaleString('en-IN')}`);
  }

  if (!card.eligibility.employmentTypes.includes(employmentType)) {
    reasons.push(`Employment type '${employmentType}' not accepted for this card`);
  }

  if (card.fees.annual > 10000 && monthlyIncome < 100000) {
    warnings.push('Premium card — ensure you can meet the annual spend waiver target');
  }

  return {
    eligible:     reasons.length === 0,
    reasons,
    warnings,
    minIncome,
    cardTier:     card.tier,
    checkPassed: {
      income:     monthlyIncome >= minIncome,
      employment: card.eligibility.employmentTypes.includes(employmentType),
    },
  };
};

module.exports = { submitApplication, getApplication, getAllApplications };
