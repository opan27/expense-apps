const db = require("../db");

exports.getOverview = async (req, res) => {
  const user_id = req.user.userId;
  const { start, end } = req.query;
  const startDate = start || "2000-01-01";
  const endDate = end || "2100-01-01";
  const [barRows] = await db.query(
    `
      SELECT group_date, label, SUM(amount) AS amount
      FROM (
        SELECT DATE(date) as group_date, DATE_FORMAT(date, '%d %b %Y') as label, amount
        FROM expense
        WHERE user_id=? AND date BETWEEN ? AND ?
      ) as sub
      GROUP BY group_date, label
      ORDER BY group_date
    `,
    [user_id, startDate, endDate]
  );
  res.json({
    barChart: barRows.map((row) => ({
      date: row.label,
      amount: row.amount,
    })),
  });
};

exports.getProfile = async (req, res) => {
  const user_id = req.user.userId;
  const [rows] = await db.query("SELECT name FROM users WHERE id=?", [user_id]);
  res.json({ userName: rows[0]?.name || "User" });
};

exports.getSummary = async (req, res) => {
  const user_id = req.user.userId;
  const [recentRows] = await db.query(
    `SELECT id, category, amount, DATE_FORMAT(date, '%d %b %Y') as date, date as isoDate
    FROM expense
    WHERE user_id=?
    ORDER BY date DESC`,
    [user_id]
  );
  const [barRows] = await db.query(
    `SELECT category, SUM(amount) as amount 
     FROM expense 
     WHERE user_id=? AND date >= CURDATE() - INTERVAL 30 DAY
     GROUP BY category`,
    [user_id]
  );
  res.json({
    recent: recentRows,
    barChart: barRows,
  });
};

exports.payInstallment = async (req, res) => {
  const user_id = req.user.userId;
  const installment_id = req.params.id;
  const { amount, date } = req.body;

  if (!amount || !date) {
    return res.status(400).json({ error: "amount dan date wajib diisi" });
  }

  // simpan sebagai expense kategori cicilan
  await db.query(
    `INSERT INTO expense (user_id, amount, category, date, installment_id)
     VALUES (?, ?, 'cicilan', ?, ?)`,
    [user_id, amount, date, installment_id]
  );

  res.json({ message: "Pembayaran cicilan tercatat" });
};

// controllers/expenseController.js

exports.addExpense = async (req, res) => {
  const { amount, category, date, installment_id } = req.body;
  const user_id = req.user.userId;

  if (!amount || !category || !date)
    return res.status(400).json({ error: "Data tidak lengkap" });

  // Jika ini pembayaran cicilan
  if (installment_id) {
    // cek apakah bulan ini sudah dibayar
    const [check] = await db.query(
      `
      SELECT id FROM expense
      WHERE user_id = ?
        AND installment_id = ?
        AND YEAR(date)  = YEAR(?)
        AND MONTH(date) = MONTH(?)
    `,
      [user_id, installment_id, date, date]
    );

    if (check.length > 0) {
      return res.status(400).json({
        error: "Cicilan bulan ini sudah dibayar.",
      });
    }
  }

  // Masukkan expense
  const [result] = await db.query(
    `INSERT INTO expense (user_id, amount, category, date, installment_id)
     VALUES (?, ?, ?, ?, ?)`,
    [user_id, amount, category, date, installment_id || null]
  );

  // Jika pembayaran cicilan, kurangi sisa bulan
  if (category === "cicilan" && installment_id) {
    await db.query(
      `
      UPDATE installments
      SET remaining_months = GREATEST(remaining_months - 1, 0),
          status = CASE
                     WHEN GREATEST(remaining_months - 1, 0) = 0 THEN 'closed'
                     ELSE status
                   END
      WHERE id = ? AND user_id = ?
    `,
      [installment_id, user_id]
    );
  }

  res.json({ message: "Expense berhasil ditambahkan", id: result.insertId });
};

exports.deleteExpense = async (req, res) => {
  const user_id = req.user.userId;
  const { id } = req.params;
  await db.query("DELETE FROM expense WHERE id = ? AND user_id = ?", [
    id,
    user_id,
  ]);
  res.json({ message: "Expense berhasil dihapus" });
};

exports.updateExpense = async (req, res) => {
  const user_id = req.user.userId;
  const { id } = req.params;
  const { amount, category, date, installment_id } = req.body;

  if (!amount || !category || !date)
    return res.status(400).json({ error: "Data tidak lengkap" });

  const [result] = await db.query(
    "UPDATE expense SET amount=?, category=?, date=?, installment_id=? WHERE id=? AND user_id=?",
    [amount, category, date, installment_id || null, id, user_id]
  );

  if (result.affectedRows > 0) {
    res.json({ message: "Expense berhasil diupdate" });
  } else {
    res.status(404).json({ error: "Expense tidak ditemukan" });
  }
};

exports.exportExpense = async (req, res) => {
  const user_id = req.user.userId;
  const { start, end } = req.query;
  const startDate = start || "2000-01-01";
  const endDate = end || "2100-01-01";
  const [rows] = await db.query(
    `SELECT category, amount, DATE_FORMAT(date, '%d %b %Y') as date
     FROM expense
     WHERE user_id=? AND date BETWEEN ? AND ?
     ORDER BY date DESC`,
    [user_id, startDate, endDate]
  );

  let csv = "Category,Amount,Date\n";
  rows.forEach((row) => {
    csv += `${row.category},${row.amount},${row.date}\n`;
  });

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="expense-export.csv"'
  );
  res.send(csv);
};
