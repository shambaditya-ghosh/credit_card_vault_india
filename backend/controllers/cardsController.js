/**
 * CardVault India — Cards Controller
 * Handles all credit card CRUD & filtering operations
 */

const CARDS = require('../data/cards');
const { AppError } = require('../middleware/errorHandler');

// Helper: paginate array
const paginate = (arr, page = 1, limit = 12) => {
  const p   = Math.max(1, parseInt(page));
  const lim = Math.min(50, Math.max(1, parseInt(limit)));
  const start = (p - 1) * lim;
  const data  = arr.slice(start, start + lim);
  return {
    data,
    pagination: {
      page: p,
      limit: lim,
      total: arr.length,
      totalPages: Math.ceil(arr.length / lim),
      hasNext: start + lim < arr.length,
      hasPrev: p > 1,
    },
  };
};

// ─── GET /cards ───────────────────────────────────────────────────────────────
const getAllCards = (req, res) => {
  const {
    page = 1, limit = 12,
    bank, category, tier, network, cardType,
    minFee, maxFee, minRating,
    sort = 'rating', order = 'desc',
    featured,
  } = req.query;

  let cards = [...CARDS];

  // Filters
  if (bank)     cards = cards.filter(c => c.bankSlug === bank.toLowerCase());
  if (category) cards = cards.filter(c => c.category.includes(category.toLowerCase()));
  if (tier)     cards = cards.filter(c => c.tier === tier.toLowerCase());
  if (network)  cards = cards.filter(c => c.network.toLowerCase().includes(network.toLowerCase()));
  if (cardType) cards = cards.filter(c => c.cardType === cardType.toLowerCase());
  if (featured === 'true') cards = cards.filter(c => c.isFeatured);
  if (minFee !== undefined) cards = cards.filter(c => c.fees.annual >= parseInt(minFee));
  if (maxFee !== undefined) cards = cards.filter(c => c.fees.annual <= parseInt(maxFee));
  if (minRating) cards = cards.filter(c => c.rating >= parseFloat(minRating));

  // Sorting
  const direction = order === 'asc' ? 1 : -1;
  const sorters = {
    rating:    (a, b) => direction * (a.rating - b.rating),
    fee:       (a, b) => direction * (a.fees.annual - b.fees.annual),
    name:      (a, b) => direction * a.name.localeCompare(b.name),
    reviews:   (a, b) => direction * (a.reviewCount - b.reviewCount),
    pointValue:(a, b) => direction * (a.rewards.pointValue - b.rewards.pointValue),
  };
  if (sorters[sort]) cards.sort(sorters[sort]);

  const result = paginate(cards, page, limit);

  res.json({
    success: true,
    ...result,
    filters: { bank, category, tier, network, cardType, featured },
    timestamp: new Date().toISOString(),
  });
};

// ─── GET /cards/featured ─────────────────────────────────────────────────────
const getFeaturedCards = (req, res) => {
  const featured = CARDS
    .filter(c => c.isFeatured && c.isActive)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);

  res.json({ success: true, data: featured, count: featured.length });
};

// ─── GET /cards/top-rated ────────────────────────────────────────────────────
const getTopRatedCards = (req, res) => {
  const { limit = 5 } = req.query;
  const top = [...CARDS]
    .filter(c => c.isActive)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, Math.min(20, parseInt(limit)));

  res.json({ success: true, data: top, count: top.length });
};

// ─── GET /cards/:id ──────────────────────────────────────────────────────────
const getCardById = (req, res, next) => {
  const card = CARDS.find(c => c.id === req.params.id || c.slug === req.params.id);
  if (!card) return next(new AppError(`Card '${req.params.id}' not found`, 404, 'CARD_NOT_FOUND'));
  res.json({ success: true, data: card });
};

// ─── GET /cards/:id/similar ──────────────────────────────────────────────────
const getSimilarCards = (req, res, next) => {
  const card = CARDS.find(c => c.id === req.params.id || c.slug === req.params.id);
  if (!card) return next(new AppError('Card not found', 404, 'CARD_NOT_FOUND'));

  const similar = CARDS
    .filter(c => c.id !== card.id && (
      c.bankSlug === card.bankSlug ||
      c.tier     === card.tier     ||
      c.category.some(cat => card.category.includes(cat))
    ))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4);

  res.json({ success: true, data: similar, count: similar.length });
};

// ─── GET /cards/tiers ────────────────────────────────────────────────────────
const getCardTiers = (req, res) => {
  const tiers = {
    entry:         { label: 'Entry Level',   annualFeeRange: '₹0 – ₹999',     minIncome: '₹15,000/mo',  count: 0 },
    mid:           { label: 'Mid Tier',      annualFeeRange: '₹1,000 – ₹2,999', minIncome: '₹30,000/mo', count: 0 },
    premium:       { label: 'Premium',       annualFeeRange: '₹3,000 – ₹8,999', minIncome: '₹75,000/mo', count: 0 },
    super_premium: { label: 'Super Premium', annualFeeRange: '₹9,000 – ₹20,000', minIncome: '₹2,00,000/mo', count: 0 },
    ultra_premium: { label: 'Ultra Premium', annualFeeRange: '₹20,000+',        minIncome: '₹5,00,000/mo', count: 0 },
  };
  CARDS.forEach(c => { if (tiers[c.tier]) tiers[c.tier].count++; });
  res.json({ success: true, data: tiers });
};

module.exports = { getAllCards, getFeaturedCards, getTopRatedCards, getCardById, getSimilarCards, getCardTiers };
