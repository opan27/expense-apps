const db = require('../db');

/**
 * Hitung ringkasan income/expense (SEMUA WAKTU, sama seperti kartu Total Balance).
 */
async function getOverallSummary(userId) {
  const [incRows] = await db.query(
    `SELECT COALESCE(SUM(amount),0) AS total
       FROM income
      WHERE user_id = ?`,
    [userId]
  );

  const [expRows] = await db.query(
    `SELECT COALESCE(SUM(amount),0) AS total
       FROM expense
      WHERE user_id = ?`,
    [userId]
  );

  const totalIncome = Number(incRows[0].total || 0);
  const totalExpense = Number(expRows[0].total || 0);
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
 * Rekomendasi pembayaran cicilan.
 * - summary: total income/expense all‑time (buat nyamain sama kartu Total Balance)
 * - totalMinimum: jumlah cicilan aktif yang BELUM dibayar bulan ini
 * - balanceAfterMinimum: summary.balance - totalMinimum
 */
exports.recommendBills = async (userId) => {
  // pakai summary versi all‑time
  const summary = await getOverallSummary(userId);
  const installments = await getActiveInstallments(userId);

  // cari cicilan yang sudah dibayar bulan INI supaya tidak dihitung lagi di minimum
  const [paidRows] = await db.query(
    `SELECT DISTINCT installment_id
       FROM expense
      WHERE user_id = ?
        AND category = 'cicilan'
        AND installment_id IS NOT NULL
        AND MONTH(date) = MONTH(CURDATE())
        AND YEAR(date)  = YEAR(CURDATE())`,
    [userId]
  );
  const paidSet = new Set(paidRows.map(r => r.installment_id));

  // hanya cicilan aktif yang BELUM dibayar bulan ini
  const requiredPayments = installments
    .filter(inst => !paidSet.has(inst.id))
    .map(inst => ({
      id: inst.id,
      name: inst.name,
      monthly_payment: Number(inst.monthly_payment || 0),
      remaining_months: inst.remaining_months,
      due_day: inst.due_day,
      interest_rate: Number(inst.interest_rate || 0),
      status: inst.status
    }));

  const totalMinimum = requiredPayments.reduce(
    (sum, r) => sum + r.monthly_payment,
    0
  );

  const balanceAfterMinimum = summary.balance - totalMinimum;

  // opsi percepatan (avalanche) pakai cicilan bunga tertinggi
  let extraSuggestion = null;
  if (balanceAfterMinimum > 0 && installments.length > 0) {
    const sortedByRate = [...installments].sort(
      (a, b) => Number(b.interest_rate || 0) - Number(a.interest_rate || 0)
    );
    const target = sortedByRate[0];
    extraSuggestion = {
      id: target.id,
      name: target.name,
      suggested_extra: balanceAfterMinimum,
      reason: 'Bunga tertinggi, cocok untuk percepatan pelunasan (metode avalanche).'
    };
  }

  let status = 'ok';
  let message = 'Saldo cukup untuk membayar semua cicilan bulan ini.';
  if (summary.balance <= 0) {
    status = 'warning';
    message =
      'Saldo bulan ini negatif atau nol; pertimbangkan menambah income atau mengurangi pengeluaran.';
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
