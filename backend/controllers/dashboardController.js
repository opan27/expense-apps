const db = require("../db");

exports.getDashboard = async (req, res) => {
  const user_id = req.user.userId;

  const [userRows] = await db.query("SELECT name FROM users WHERE id=?", [
    user_id,
  ]);
  const userName = userRows[0]?.name || "User";

  const [incomeRows] = await db.query(
    "SELECT SUM(amount) as total FROM income WHERE user_id=?",
    [user_id]
  );
  const [expenseRows] = await db.query(
    "SELECT SUM(amount) as total FROM expense WHERE user_id=?",
    [user_id]
  );

  const [chartRows] = await db.query(
    `
    SELECT DATE(date) as date,
           SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as income,
           SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as expense
    FROM (
      SELECT amount, date, 'income' as type FROM income WHERE user_id=?
      UNION ALL
      SELECT amount, date, 'expense' as type FROM expense WHERE user_id=?
    ) t
    GROUP BY DATE(date) ORDER BY date DESC LIMIT 7
  `,
    [user_id, user_id]
  );

  const [latestRows] = await db.query(
    `
    SELECT DATE_FORMAT(date, '%d %b %Y') as date, category, amount, 'income' as type
    FROM income WHERE user_id=?
    UNION ALL
    SELECT DATE_FORMAT(date, '%d %b %Y') as date, category, amount, 'expense' as type
    FROM expense WHERE user_id=?
    ORDER BY date DESC LIMIT 5
  `,
    [user_id, user_id]
  );

  res.json({
    userName,
    totalIncome: incomeRows[0].total || 0,
    totalExpense: expenseRows[0].total || 0,
    trxChart: chartRows.reverse(),
    latest: latestRows,
  });
};
