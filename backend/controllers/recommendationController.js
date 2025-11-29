const recommendationService = require('../services/recommendationService');

exports.getRecommendations = async (req, res) => {
  try {
    const { userId, lat, lon, maxDistance } = req.body;
    const result = await recommendationService.recommend(userId, lat, lon, maxDistance);
    res.json(result);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
};
