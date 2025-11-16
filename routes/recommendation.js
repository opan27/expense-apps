const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');

router.post('/recommendations', recommendationController.getRecommendations);

module.exports = router;
