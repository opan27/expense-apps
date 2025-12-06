const recommendationService = require("../services/recommendationService");

exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user.userId;
    const category = (req.query.category || "all").toLowerCase(); // all | fashion | electronics | furniture
    const data = await recommendationService.recommendByCategory(
      userId,
      category
    );
    res.json({
      balance: data.balance,
      category,
      recommendations: data.recommendations,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Gagal mengambil rekomendasi" });
  }
};
