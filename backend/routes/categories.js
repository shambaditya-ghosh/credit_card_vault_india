// categories.js
const express = require('express');
const router  = express.Router();
const CARDS   = require('../data/cards');

const CATEGORIES = {
  premium:   { label: 'Premium & Super Premium', icon: '💎', desc: 'Elite lifestyle, metal cards, unlimited lounge' },
  travel:    { label: 'Travel',                  icon: '✈️', desc: 'Miles, lounge access & forex benefits' },
  cashback:  { label: 'Cashback',                icon: '💸', desc: 'Direct cashback on every purchase' },
  shopping:  { label: 'Shopping',                icon: '🛍️', desc: 'Best for online & offline shopping' },
  lifestyle: { label: 'Lifestyle',               icon: '🎯', desc: 'Dining, entertainment & wellness' },
  fuel:      { label: 'Fuel',                    icon: '⛽', desc: 'Fuel surcharge waiver & station rewards' },
  miles:     { label: 'Miles & Points',          icon: '🏆', desc: 'Airline miles & hotel points maximisers' },
  online:    { label: 'Online',                  icon: '🌐', desc: 'Best rates on e-commerce & subscriptions' },
};

router.get('/', (req, res) => {
  const enriched = Object.entries(CATEGORIES).map(([key, val]) => ({
    id: key, ...val,
    cardCount: CARDS.filter(c => c.category.includes(key)).length,
  }));
  res.json({ success: true, data: enriched });
});

router.get('/:id', (req, res) => {
  const cat   = CATEGORIES[req.params.id];
  const cards = CARDS.filter(c => c.category.includes(req.params.id));
  if (!cat) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Category not found' } });
  res.json({ success: true, data: { ...cat, id: req.params.id, cards, count: cards.length } });
});

module.exports = router;
