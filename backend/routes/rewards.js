const express = require('express');
const router  = express.Router();
const CARDS   = require('../data/cards');

// GET /api/v1/rewards — best reward programs ranked
router.get('/', (req, res) => {
  const ranked = [...CARDS]
    .filter(c => c.isActive)
    .sort((a, b) => parseFloat(b.rewards.effectiveReturn) - parseFloat(a.rewards.effectiveReturn))
    .map(c => ({
      cardId:          c.id,
      cardName:        c.name,
      bank:            c.bank,
      baseEarnRate:    c.rewards.baseEarnRate,
      acceleratedEarn: c.rewards.acceleratedEarn,
      effectiveReturn: c.rewards.effectiveReturn,
      pointValue:      c.rewards.pointValue,
      transferPartners: c.rewards.transferPartners,
      redemptionOptions: c.rewards.redemptionOptions,
    }));

  res.json({
    success: true,
    data: ranked,
    tips: [
      'Transfer points to airline miles for 2–5x more value than direct redemption',
      'Use HDFC SmartBuy portal for 10X reward acceleration',
      'Amex MR points can be redeemed against 18K gold coins for excellent value',
      'Axis EDGE Miles transfer to 10+ partners — best in India for travel hacking',
    ],
  });
});

// GET /api/v1/rewards/calculator — estimate rewards for a spend
router.post('/calculator', (req, res) => {
  const { cardId, monthlySpend = 30000, spendCategory = 'general' } = req.body;
  const card = CARDS.find(c => c.id === cardId || c.slug === cardId);

  if (!card) return res.status(404).json({ success: false, error: { code: 'CARD_NOT_FOUND', message: 'Card not found' } });

  const annualSpend  = monthlySpend * 12;
  const baseReturn   = parseFloat(card.rewards.effectiveReturn) / 100 || 0.013;
  const estimatedAnnualRewards = Math.round(annualSpend * baseReturn);
  const netBenefit   = estimatedAnnualRewards - card.fees.annual - Math.round(card.fees.annual * 0.18);

  res.json({
    success: true,
    data: {
      card:      card.shortName,
      monthlySpend,
      annualSpend,
      annualFee: card.fees.annual,
      estimatedAnnualRewards,
      netBenefit,
      breakEvenMonthlySpend: Math.ceil((card.fees.annual * 1.18) / (baseReturn * 12)),
      worthIt: netBenefit > 0,
    },
  });
});

module.exports = router;
