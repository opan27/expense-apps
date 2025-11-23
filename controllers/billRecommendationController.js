const billRecommendationService = require('../services/billRecommendationService');

exports.getBillRecommendations = async (req, res) => {
  try {
    const userId = req.user.userId;
    const data = await billRecommendationService.recommendBills(userId);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menghitung rekomendasi cicilan' });
  }
};
