const db = require("../db");

exports.getProfile = async (req, res) => {
  const user_id = req.user.userId;
  const [rows] = await db.query("SELECT name FROM users WHERE id=?", [user_id]);
  res.json({ userName: rows[0]?.name || "User" });
};

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
          FROM income
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

exports.getSummary = async (req, res) => {
  const user_id = req.user.userId;
  const [recent] = await db.query(
    `SELECT id, category, amount, DATE_FORMAT(date, '%d %b %Y') as date, date as isoDate
    FROM income WHERE user_id=?
    ORDER BY date DESC LIMIT 5`,
    [user_id]
  );
  const [donutChart] = await db.query(
    `SELECT category, SUM(amount) as amount FROM income WHERE user_id=? AND date >= CURDATE() - INTERVAL 60 DAY GROUP BY category`,
    [user_id]
  );
  res.json({ recent, donutChart });
};

exports.addIncome = async (req, res) => {
  const { amount, category, date } = req.body;
  const user_id = req.user.userId;
  if (!amount || !category || !date)
    return res.status(400).json({ error: "Data tidak lengkap" });
  await db.query(
    "INSERT INTO income (user_id, amount, category, date) VALUES (?, ?, ?, ?)",
    [user_id, amount, category, date]
  );
  res.json({ message: "Income berhasil ditambahkan" });
};

exports.deleteIncome = async (req, res) => {
  const user_id = req.user.userId;
  const { id } = req.params;
  await db.query("DELETE FROM income WHERE id = ? AND user_id = ?", [
    id,
    user_id,
  ]);
  res.json({ message: "Income berhasil dihapus" });
};

exports.updateIncome = async (req, res) => {
  const user_id = req.user.userId;
  const { id } = req.params;
  const { amount, category, date } = req.body;
  if (!amount || !category || !date)
    return res.status(400).json({ error: "Data tidak lengkap" });
  const [result] = await db.query(
    "UPDATE income SET amount=?, category=?, date=? WHERE id=? AND user_id=?",
    [amount, category, date, id, user_id]
  );
  if (result.affectedRows > 0) {
    res.json({ message: "Income berhasil diupdate" });
  } else {
    res.status(404).json({ error: "Income tidak ditemukan" });
  }
};

exports.exportIncome = async (req, res) => {
  const user_id = req.user.userId;
  const { start, end } = req.query;
  const startDate = start || "2000-01-01";
  const endDate = end || "2100-01-01";

  try {
    const [rows] = await db.query(
      `SELECT category, amount, DATE_FORMAT(date, '%d %b %Y') as date
       FROM income 
       WHERE user_id=? AND date BETWEEN ? AND ?
       ORDER BY date DESC`,
      [user_id, startDate, endDate]
    );

    // Generate CSV content
    let csvContent = "Category,Amount,Date\n";
    rows.forEach((row) => {
      csvContent += `"${row.category}","${row.amount}","${row.date}"\n`;
    });

    // Set headers for file download
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="income-report-${startDate}-to-${endDate}.csv"`
    );
    res.send(csvContent);
  } catch (error) {
    console.error("Error exporting income:", error);
    res.status(500).json({ error: "Gagal mengexport data" });
  }
};
