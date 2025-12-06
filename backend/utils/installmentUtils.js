// utils/installmentUtils.js

function diffMonths(startDateStr, now = new Date()) {
  if (!startDateStr) return 0;
  const start = new Date(startDateStr);
  if (isNaN(start)) return 0;

  let months =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth());

  // Kalau hari sekarang < hari mulai, anggap bulan berjalan belum penuh
  if (now.getDate() < start.getDate()) months -= 1;

  return months < 0 ? 0 : months;
}

function computeRemainingMonths(startDateStr, totalMonths, now = new Date()) {
  if (!totalMonths) return 0;
  const passed = diffMonths(startDateStr, now);
  const remaining = totalMonths - passed;
  return remaining > 0 ? remaining : 0;
}

module.exports = {
  diffMonths,
  computeRemainingMonths
};
