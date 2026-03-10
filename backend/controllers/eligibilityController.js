/**
 * CardVault India — Eligibility Controller
 * Recommends cards based on user profile
 */
const CARDS = require('../data/cards');
const { validationResult } = require('express-validator');

const checkEligibility = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, error: { code: 'VALIDATION_ERROR', details: errors.array() } });
  }

  const {
    monthlyIncome,
    employmentType = 'salaried',
    cibilScore = 750,
    preferredCategory,
    monthlySpend = 30000,
  } = req.body;

  const eligible   = [];
  const notEligible = [];

  CARDS.forEach(card => {
    const minIncome = employmentType === 'salaried'
      ? card.eligibility.minMonthlyIncomeSalaried
      : card.eligibility.minMonthlyIncomeSelfEmployed;

    const incomeOk     = monthlyIncome >= minIncome;
    const cibilOk      = cibilScore >= card.eligibility.minCibilScore;
    const employmentOk = card.eligibility.employmentTypes.includes(employmentType);
    const categoryMatch = !preferredCategory || card.category.includes(preferredCategory);

    const isEligible = incomeOk && cibilOk && employmentOk;

    const scoreFactors = [
      isEligible    ? 40 : 0,
      categoryMatch ? 30 : 0,
      cibilOk       ? 20 : 0,
      incomeOk      ? 10 : 0,
    ];
    const matchScore = scoreFactors.reduce((a, b) => a + b, 0);

    const entry = {
      card: {
        id:      card.id,
        name:    card.name,
        bank:    card.bank,
        tier:    card.tier,
        rating:  card.rating,
        annualFee: card.fees.annual,
        effectiveReturn: card.rewards.effectiveReturn,
      },
      matchScore,
      eligibilityStatus: {
        income:     incomeOk     ? 'pass' : 'fail',
        cibil:      cibilOk      ? 'pass' : 'fail',
        employment: employmentOk ? 'pass' : 'fail',
      },
      isEligible,
      reason: !isEligible ? [
        !incomeOk     && `Min income needed: ₹${minIncome.toLocaleString('en-IN')}/month`,
        !cibilOk      && `Min CIBIL score: ${card.eligibility.minCibilScore}`,
        !employmentOk && `Employment type '${employmentType}' not eligible`,
      ].filter(Boolean) : [],
    };

    (isEligible ? eligible : notEligible).push(entry);
  });

  eligible.sort((a, b) => b.matchScore - a.matchScore);

  res.json({
    success: true,
    profile: { monthlyIncome, employmentType, cibilScore, preferredCategory, monthlySpend },
    summary: {
      totalCards:      CARDS.length,
      eligibleCards:   eligible.length,
      topRecommended:  eligible.slice(0, 3).map(e => e.card.name),
    },
    data: {
      eligible:    eligible.slice(0, 10),
      notEligible: notEligible.slice(0, 5),
    },
  });
};

module.exports = { checkEligibility };
