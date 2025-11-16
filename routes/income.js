const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.sendStatus(401);
  const token = authHeader.split(' ')[1];
  try {
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user;
    next();
  } catch {
    return res.sendStatus(403);
  }
}

router.get('/profile', authMiddleware, async (req, res) => {
  const user_id = req.user.userId;
  // Ganti 'users' dan 'name' sesuai skema database (misal: username)
  const [rows] = await db.query('SELECT name FROM users WHERE id=?', [user_id]);
  res.json({ userName: rows[0]?.name || 'User' });
});

// Tambahkan setelah middleware dan sebelum module.exports di routes/income.js:
router.get('/overview', authMiddleware, async (req, res) => {
  const user_id = req.user.userId;
  const { start, end } = req.query;
  const startDate = start || '2000-01-01';
  const endDate = end || '2100-01-01';
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
    barChart: barRows.map(row => ({
      date: row.label,
      amount: row.amount
    }))
  });
});

// GET semua income
router.get('/summary', authMiddleware, async (req, res) => {
  const user_id = req.user.userId;
  // Perhatikan: Tidak ada TAB/spasi sebelum SELECT!
  const [recent] = await db.query(`
SELECT id, category, amount, DATE_FORMAT(date, '%d %b %Y') as date, date as isoDate
FROM income
WHERE user_id=?
ORDER BY date DESC LIMIT 5
  `, [user_id]);
  const [donutChart] = await db.query(
    `SELECT category, SUM(amount) as amount FROM income WHERE user_id=? AND date >= CURDATE() - INTERVAL 60 DAY GROUP BY category`, [user_id]);
  res.json({ recent, donutChart });
});

// POST tambah income baru
router.post('/', authMiddleware, async (req, res) => {
  const { amount, category, date } = req.body;
  const user_id = req.user.userId;
  if (!amount || !category || !date)
    return res.status(400).json({ error: 'Data tidak lengkap' });
  await db.query(
    'INSERT INTO income (user_id, amount, category, date) VALUES (?, ?, ?, ?)',
    [user_id, amount, category, date]
  );
  res.json({ message: 'Income berhasil ditambahkan' });
});

// DELETE income
router.delete('/:id', authMiddleware, async (req, res) => {
  const user_id = req.user.userId;
  const { id } = req.params;
  await db.query(
    'DELETE FROM income WHERE id = ? AND user_id = ?',
    [id, user_id]
  );
  res.json({ message: 'Income berhasil dihapus' });
});

// PATCH/PUT edit income
router.put('/:id', authMiddleware, async (req, res) => {
  const user_id = req.user.userId;
  const { id } = req.params;
  const { amount, category, date } = req.body;
  if (!amount || !category || !date) 
    return res.status(400).json({ error: 'Data tidak lengkap' });
  const [result] = await db.query(
    'UPDATE income SET amount=?, category=?, date=? WHERE id=? AND user_id=?',
    [amount, category, date, id, user_id]
  );
  if (result.affectedRows > 0) {
    res.json({ message: 'Income berhasil diupdate' });
  } else {
    res.status(404).json({ error: 'Income tidak ditemukan' });
  }
});

// OPTIONAL: GET semua income (utk loop nampilin id) -- summary juga perlu id



module.exports = router;
