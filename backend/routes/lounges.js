// lounges.js
const express = require('express');
const router  = express.Router();
const CARDS   = require('../data/cards');

const LOUNGE_NETWORKS = {
  priority_pass: {
    name: 'Priority Pass',
    description: 'World\'s largest independent airport lounge program with 1,400+ lounges',
    globalCount: 1400, indianAirports: 35,
    website: 'https://www.prioritypass.com',
    type: 'International + Domestic',
  },
  dragon_pass: {
    name: 'Dragon Pass',
    description: 'Asia-Pacific focused lounge network with strong presence in Indian airports',
    globalCount: 1300, indianAirports: 40,
    website: 'https://www.dragonpass.com',
    type: 'International + Domestic',
  },
  visa_lounges: {
    name: 'Visa Airport Lounges',
    description: 'Exclusive lounges for Visa cardholders at major Indian airports',
    globalCount: 0, indianAirports: 12,
    website: 'https://www.visa.com',
    type: 'Domestic India',
  },
  mastercard_lounges: {
    name: 'Mastercard Lounges',
    description: 'Domestic airport lounges for Mastercard premium cardholders',
    globalCount: 0, indianAirports: 15,
    website: 'https://www.mastercard.com',
    type: 'Domestic India',
  },
};

router.get('/', (req, res) => {
  const unlimitedCards = CARDS.filter(c => c.lounge.domestic === 'Unlimited' || c.lounge.international?.includes('Unlimited'));
  res.json({
    success: true,
    data: {
      networks: LOUNGE_NETWORKS,
      stats: {
        totalGlobalLounges: 1400,
        totalIndianAirports: 58,
        averageDayPassCost: 2500,
        unlimitedAccessCards: unlimitedCards.length,
      },
      cardsWithUnlimitedAccess: unlimitedCards.map(c => ({
        id: c.id, name: c.shortName, bank: c.bank,
        lounge: c.lounge, annualFee: c.fees.annual,
      })),
    },
  });
});

router.get('/networks', (req, res) => {
  res.json({ success: true, data: LOUNGE_NETWORKS });
});

module.exports = router;
