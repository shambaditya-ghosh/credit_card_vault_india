/**
 * CardVault India — Comparison Controller
 */

const CARDS = require('../data/cards');
const { AppError } = require('../middleware/errorHandler');

const compareCards = (req, res, next) => {
  const { ids } = req.query; // ?ids=hdfc-infinia,axis-atlas,amazon-pay-icici
  if (!ids) return next(new AppError('Provide card IDs as ?ids=id1,id2,id3', 400, 'NO_IDS'));

  const idList = ids.split(',').map(s => s.trim()).slice(0, 5);
  const cards  = idList.map(id => CARDS.find(c => c.id === id || c.slug === id)).filter(Boolean);

  if (cards.length < 2) return next(new AppError('Provide at least 2 valid card IDs', 400, 'MIN_CARDS'));

  // Build comparison matrix
  const fields = [
    { key: 'Annual Fee',        get: c => c.fees.annual === 0 ? 'FREE' : `₹${c.fees.annual.toLocaleString('en-IN')} + GST` },
    { key: 'Joining Fee',       get: c => c.fees.joining === 0 ? 'FREE' : `₹${c.fees.joining.toLocaleString('en-IN')} + GST` },
    { key: 'Fee Waiver',        get: c => c.fees.feeWaiverSpend ? `₹${(c.fees.feeWaiverSpend/100000).toFixed(1)}L spend` : 'Not available' },
    { key: 'Reward Rate',       get: c => c.rewards.baseEarnRate },
    { key: 'Accelerated Earn',  get: c => c.rewards.acceleratedEarn },
    { key: 'Effective Return',  get: c => c.rewards.effectiveReturn },
    { key: 'Point Value',       get: c => `₹${c.rewards.pointValue} per point` },
    { key: 'Point Expiry',      get: c => c.rewards.pointExpiry },
    { key: 'Domestic Lounge',   get: c => c.lounge.domestic },
    { key: 'International Lounge', get: c => c.lounge.international },
    { key: 'Lounge Network',    get: c => c.lounge.network },
    { key: 'Forex Markup',      get: c => c.fees.fxMarkupPercent === 0 ? '0% (None)' : `${c.fees.fxMarkupPercent}%` },
    { key: 'Card Network',      get: c => c.network },
    { key: 'Card Type',         get: c => c.cardType.charAt(0).toUpperCase() + c.cardType.slice(1) },
    { key: 'Rating',            get: c => `${c.rating}/5 (${c.reviewCount.toLocaleString()} reviews)` },
    { key: 'Transfer Partners', get: c => c.rewards.transferPartners.length > 0 ? c.rewards.transferPartners.join(', ') : 'None' },
    { key: 'Interest Rate',     get: c => c.fees.interestRateMonthly ? `${c.fees.interestRateMonthly}%/mo (${c.fees.interestRateAnnual}% p.a.)` : 'Charge Card' },
    { key: 'Min Income (Salaried)', get: c => `₹${c.eligibility.minMonthlyIncomeSalaried.toLocaleString('en-IN')}/month` },
    { key: 'Min CIBIL Score',   get: c => `${c.eligibility.minCibilScore}+` },
  ];

  const matrix = fields.map(f => ({
    feature: f.key,
    values:  cards.map(c => ({ cardId: c.id, cardName: c.shortName, value: f.get(c) })),
  }));

  res.json({
    success: true,
    data: { cards: cards.map(c => ({ id: c.id, name: c.name, shortName: c.shortName, bank: c.bank, rating: c.rating })), matrix },
  });
};

module.exports = { compareCards };
