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

exports.addExpense = async (req, res) => {
  const { amount, category, date } = req.body;
  const user_id = req.user.userId;
  if (!amount || !category || !date)
    return res.status(400).json({ error: "Data tidak lengkap" });
  await db.query(
    "INSERT INTO expense (user_id, amount, category, date) VALUES (?, ?, ?, ?)",
    [user_id, amount, category, date]
  );
  res.json({ message: "Expense berhasil ditambahkan" });
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
  const { amount, category, date } = req.body;
  if (!amount || !category || !date)
    return res.status(400).json({ error: "Data tidak lengkap" });
  const [result] = await db.query(
    "UPDATE expense SET amount=?, category=?, date=? WHERE id=? AND user_id=?",
    [amount, category, date, id, user_id]
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
