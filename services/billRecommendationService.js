const db = require('../db');

/**
 * Hitung ringkasan income/expense bulan berjalan.
 */
async function getThisMonthSummary(userId) {
  // Asumsi kolom date di income/expense bertipe DATE / DATETIME
  const [incRows] = await db.query(
    `SELECT COALESCE(SUM(amount),0) AS total
     FROM income
     WHERE user_id = ? AND MONTH(date) = MONTH(CURDATE()) AND YEAR(date) = YEAR(CURDATE())`,
    [userId]
  );
  const [expRows] = await db.query(
    `SELECT COALESCE(SUM(amount),0) AS total
     FROM expense
     WHERE user_id = ? AND MONTH(date) = MONTH(CURDATE()) AND YEAR(date) = YEAR(CURDATE())`,
    [userId]
  );

  const totalIncome = incRows[0].total || 0;
  const totalExpense = expRows[0].total || 0;
  const balance = totalIncome - totalExpense;

  return { totalIncome, totalExpense, balance };
}

/**
 * Ambil semua cicilan aktif user.
 */
async function getActiveInstallments(userId) {
  const [rows] = await db.query(
    `SELECT *
     FROM installments
     WHERE user_id = ? AND status = 'active'
     ORDER BY due_day ASC`,
    [userId]
  );
  return rows;
}

/**
 * Rekomendasi pembayaran cicilan bulan ini (versi simple).
 */
exports.recommendBills = async (userId) => {
  const summary = await getThisMonthSummary(userId);
  const installments = await getActiveInstallments(userId);

  const requiredPayments = installments.map(inst => ({
    id: inst.id,
    name: inst.name,
    monthly_payment: inst.monthly_payment,
    remaining_months: inst.remaining_months,
    due_day: inst.due_day,
    interest_rate: inst.interest_rate,
    status: inst.status
  }));

  const totalMinimum = requiredPayments.reduce(
    (sum, r) => sum + Number(r.monthly_payment || 0),
    0
  );

  const balanceAfterMinimum = summary.balance - totalMinimum;

  // pilih cicilan dengan bunga tertinggi sebagai kandidat percepatan (avalanche-style) [web:21][web:33]
  let extraSuggestion = null;
  if (balanceAfterMinimum > 0 && installments.length > 0) {
    const sortedByRate = [...installments].sort((a, b) =>
      Number(b.interest_rate || 0) - Number(a.interest_rate || 0)
    );
    const target = sortedByRate[0];
    extraSuggestion = {
      id: target.id,
      name: target.name,
      suggested_extra: balanceAfterMinimum, // sarankan semua sisa dipakai accelerate satu cicilan
      reason: 'Bunga tertinggi, cocok untuk percepatan pelunasan (metode avalanche).'
    };
  }

  let status = 'ok';
  let message = 'Saldo cukup untuk membayar semua cicilan bulan ini.';
  if (summary.balance <= 0) {
    status = 'warning';
    message = 'Saldo bulan ini negatif atau nol; pertimbangkan menambah income atau mengurangi pengeluaran.';
  } else if (summary.balance < totalMinimum) {
    status = 'warning';
    message = 'Saldo tidak cukup untuk menutup semua cicilan minimum bulan ini.';
  }

  return {
    summary,
    totalMinimum,
    balanceAfterMinimum,
    requiredPayments,
    extraSuggestion,
    status,
    message
  };
};
