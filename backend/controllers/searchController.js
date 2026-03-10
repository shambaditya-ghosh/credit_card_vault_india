/**
 * CardVault India — Search Controller
 */
const CARDS = require('../data/cards');
const BANKS = require('../data/banks');

const search = (req, res) => {
  const { q, limit = 10 } = req.query;
  if (!q || q.trim().length < 2) {
    return res.status(400).json({ success: false, error: { code: 'QUERY_TOO_SHORT', message: 'Search query must be at least 2 characters' } });
  }

  const query = q.toLowerCase().trim();
  const lim   = Math.min(20, parseInt(limit));

  const cardResults = CARDS
    .filter(c => (
      c.name.toLowerCase().includes(query) ||
      c.bank.toLowerCase().includes(query) ||
      c.category.some(cat => cat.includes(query)) ||
      c.tags.some(tag => tag.toLowerCase().includes(query)) ||
      c.network.toLowerCase().includes(query) ||
      c.tier.toLowerCase().includes(query)
    ))
    .slice(0, lim)
    .map(c => ({ type: 'card', id: c.id, name: c.name, bank: c.bank, rating: c.rating, fee: c.fees.annual, tier: c.tier }));

  const bankResults = BANKS
    .filter(b => b.name.toLowerCase().includes(query) || b.description.toLowerCase().includes(query))
    .slice(0, 3)
    .map(b => ({ type: 'bank', id: b.id, name: b.name, cardCount: b.cardCount }));

  res.json({
    success: true,
    query: q,
    results: [...cardResults, ...bankResults],
    total: cardResults.length + bankResults.length,
  });
};

module.exports = { search };
