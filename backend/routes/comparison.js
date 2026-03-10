const express = require('express');
const router  = express.Router();
const { compareCards } = require('../controllers/comparisonController');

/**
 * @route  GET /api/v1/compare
 * @query  ids=card1,card2,card3 (2-5 cards)
 */
router.get('/', compareCards);

module.exports = router;
