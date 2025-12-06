// services/installmentService.js
const db = require('../db');
const { computeRemainingMonths } = require('../utils/installmentUtils');

async function getUpcomingInstallments(userId, daysAhead = 10) {
  const [rows] = await db.query(
    `
      SELECT 
        inst.*,
        -- hitung tanggal jatuh tempo berikutnya
        CASE
          WHEN STR_TO_DATE(CONCAT(YEAR(CURDATE()), '-', MONTH(CURDATE()), '-', inst.due_day), '%Y-%m-%d') >= CURDATE()
          THEN STR_TO_DATE(CONCAT(YEAR(CURDATE()), '-', MONTH(CURDATE()), '-', inst.due_day), '%Y-%m-%d')
          ELSE DATE_ADD(
                 STR_TO_DATE(CONCAT(YEAR(CURDATE()), '-', MONTH(CURDATE()), '-', inst.due_day), '%Y-%m-%d'),
                 INTERVAL 1 MONTH
               )
        END AS next_due_date
      FROM installments inst
      WHERE inst.user_id = ?
        AND inst.status = 'active'
    `,
    [userId]
  );

  const filtered = [];

  for (const row of rows) {
    const due = new Date(row.next_due_date);
    const now = new Date();

    // batas reminder
    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() + daysAhead);

    // skip kalau tidak dalam range reminder
    if (due < now || due > limitDate) continue;

    // Cek apakah bulan ini sudah dibayar
    const [paid] = await db.query(
      `
      SELECT id FROM expense
      WHERE user_id = ?
        AND installment_id = ?
        AND YEAR(date) = YEAR(?)
        AND MONTH(date) = MONTH(?)
      LIMIT 1
    `,
      [userId, row.id, due, due]
    );

    if (paid.length) continue; // skip kalau sudah bayar

    filtered.push({
      ...row,
      next_due_date: row.next_due_date,
      remaining_months: row.remaining_months ?? computeRemainingMonths(row.start_date, row.total_months),

    });
  }

  return filtered.sort((a, b) => new Date(a.next_due_date) - new Date(b.next_due_date));
}

module.exports = {
  getUpcomingInstallments
};
