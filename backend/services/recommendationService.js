const axios = require("axios");
const db = require("../db");

// Kategori UI -> kategori DummyJSON
const CATEGORY_MAP = {
  all: null, // tidak filter kategori
  fashion: [
    "mens-shirts",
    "mens-shoes",
    "mens-watches",
    "womens-dresses",
    "womens-shoes",
    "womens-watches",
    "womens-bags",
  ],
  electronics: ["smartphones", "laptops"],
  furniture: ["furniture", "home-decoration", "lighting"],
};

const USD_TO_IDR = 16000; // kurs kira‑kira

async function getUserBalance(userId) {
  const [incomeRows] = await db.query(
    "SELECT COALESCE(SUM(amount),0) as total FROM income WHERE user_id=?",
    [userId]
  );
  const [expenseRows] = await db.query(
    "SELECT COALESCE(SUM(amount),0) as total FROM expense WHERE user_id=?",
    [userId]
  );
  return (incomeRows[0].total || 0) - (expenseRows[0].total || 0);
}

exports.recommendByCategory = async (userId, categoryKey) => {
  const balance = await getUserBalance(userId);

  // Ambil produk dari DummyJSON (1x call, lalu filter sendiri) [web:3][web:4]
  const res = await axios.get("https://dummyjson.com/products?limit=100");
  const products = res.data.products || [];

  const allowedCats = CATEGORY_MAP[categoryKey] || null;

  const filtered = products.filter((p) => {
    if (allowedCats && !allowedCats.includes(p.category)) return false;
    const priceIdr = Math.round(p.price * USD_TO_IDR);
    return priceIdr <= balance; // hanya produk di bawah / sama dengan balance
  });

  const recommendations = filtered
    .map((p) => {
      const priceIdr = Math.round(p.price * USD_TO_IDR);
      // scoring sederhana: murah + rating tinggi
      const rating = p.rating?.rate || p.rating || 0;
      const skorHarga = priceIdr < balance ? 0.6 : 0.1;
      const skorRating = (rating / 5) * 0.4;
      const finalScore = (skorHarga + skorRating).toFixed(4);
      return {
        id: p.id,
        name: p.title,
        category: p.category,
        priceIdr,
        rating,
        finalScore,
      };
    })
    .sort((a, b) => b.finalScore - a.finalScore);

  return { balance, recommendations };
};
