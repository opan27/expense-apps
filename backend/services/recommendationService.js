const axios = require('axios');
const scorer = require('../utils/recommendationScorer');

exports.recommend = async (userId, lat, lon, maxDistance) => {
  // Ganti ke API eksternal opensource, misal fakestoreapi.com
  const response = await axios.get('https://fakestoreapi.com/products');
  const products = response.data;

  // Dummy saldo, bisa diambil dari DB real sesuai userId
  const saldo = 3500000;

  const recommendations = products.map(item => ({
    id: item.id,
    name: item.title,
    price: item.price,
    category: item.category,
    rating: item.rating?.rate || 0,
    finalScore: scorer({
      price: item.price,
      rating: item.rating?.rate || 0,
      saldo
    })
  }))
  .filter(item => item.price <= saldo)
  .sort((a,b)=>b.finalScore-a.finalScore);

  return {
    userinput: { userId, lat, lon, maxDistance },
    recommendations
  };
};
