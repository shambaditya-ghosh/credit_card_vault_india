/**
 * CardVault India — Cards Routes
 * Base: /api/v1/cards
 */
const express = require('express');
const router  = express.Router();
const {
  getAllCards, getFeaturedCards, getTopRatedCards,
  getCardById, getSimilarCards, getCardTiers,
} = require('../controllers/cardsController');

/**
 * @route  GET /api/v1/cards
 * @desc   Get all cards with filtering, sorting & pagination
 * @query  page, limit, bank, category, tier, network, cardType, minFee, maxFee, minRating, sort, order, featured
 */
router.get('/', getAllCards);

/**
 * @route  GET /api/v1/cards/featured
 * @desc   Get featured/editor's choice cards
 */
router.get('/featured', getFeaturedCards);

/**
 * @route  GET /api/v1/cards/top-rated
 * @desc   Get top-rated cards
 * @query  limit (default: 5)
 */
router.get('/top-rated', getTopRatedCards);

/**
 * @route  GET /api/v1/cards/tiers
 * @desc   Get card tiers with metadata
 */
router.get('/tiers', getCardTiers);

/**
 * @route  GET /api/v1/cards/:id
 * @desc   Get single card by ID or slug
 */
router.get('/:id', getCardById);

/**
 * @route  GET /api/v1/cards/:id/similar
 * @desc   Get similar cards
 */
router.get('/:id/similar', getSimilarCards);

module.exports = router;
