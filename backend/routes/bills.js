const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/jwtAuth');
const billRecommendationController = require('../controllers/billRecommendationController');

router.get(
  '/bills/recommendations',
  authMiddleware,
  billRecommendationController.getBillRecommendations
);

module.exports = router;   // <- PASTIKAN begini
