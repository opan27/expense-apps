module.exports = ({ price, rating, saldo }) => {
  const skorHarga = price < saldo ? 0.6 : 0.1;
  const skorRating = (rating/5) * 0.4;
  return (skorHarga + skorRating).toFixed(4);
};
