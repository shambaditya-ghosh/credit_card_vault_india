/**
 * CardVault India — Banks Routes
 * Base: /api/v1/banks
 */
const express = require('express');
const router  = express.Router();
const BANKS   = require('../data/banks');
const CARDS   = require('../data/cards');
const { AppError } = require('../middleware/errorHandler');

router.get('/', (req, res) => {
  res.json({ success: true, data: BANKS, count: BANKS.length });
});

router.get('/:slug', (req, res, next) => {
  const bank = BANKS.find(b => b.slug === req.params.slug || b.id === req.params.slug);
  if (!bank) return next(new AppError('Bank not found', 404, 'BANK_NOT_FOUND'));
  const cards = CARDS.filter(c => c.bankSlug === bank.slug);
  res.json({ success: true, data: { ...bank, cards, cardCount: cards.length } });
});

router.get('/:slug/cards', (req, res, next) => {
  const bank = BANKS.find(b => b.slug === req.params.slug);
  if (!bank) return next(new AppError('Bank not found', 404, 'BANK_NOT_FOUND'));
  const cards = CARDS.filter(c => c.bankSlug === bank.slug);
  res.json({ success: true, data: cards, count: cards.length, bank: bank.name });
});

module.exports = router;
