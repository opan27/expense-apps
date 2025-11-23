const db = require('../db');

exports.getAll = async (req, res) => {
  const userId = req.user.userId;
  const [rows] = await db.query(
    'SELECT * FROM installments WHERE user_id=? AND status <> "deleted"',
    [userId]
  );
  res.json(rows);
};

exports.getById = async (req, res) => {
  const userId = req.user.userId;
  const id = req.params.id;
  const [rows] = await db.query(
    'SELECT * FROM installments WHERE id=? AND user_id=?',
    [id, userId]
  );
  if (!rows.length) return res.status(404).json({ message: 'Installment not found' });
  res.json(rows[0]);
};

exports.create = async (req, res) => {
  const userId = req.user.userId;
  const {
    name,
    principal,
    interest_rate,
    monthly_payment,
    remaining_months,
    start_date,
    due_day,
    notes
  } = req.body;

  const [result] = await db.query(
    `INSERT INTO installments
     (user_id, name, principal, interest_rate, monthly_payment,
      remaining_months, start_date, due_day, status, notes)
     VALUES (?,?,?,?,?,?,?,?, 'active', ?)`,
    [
      userId,
      name,
      principal,
      interest_rate || 0,
      monthly_payment,
      remaining_months,
      start_date,
      due_day,
      notes || null
    ]
  );

  const [rows] = await db.query(
    'SELECT * FROM installments WHERE id=?',
    [result.insertId]
  );
  res.status(201).json(rows[0]);
};

exports.update = async (req, res) => {
  const userId = req.user.userId;
  const id = req.params.id;
  const {
    name,
    principal,
    interest_rate,
    monthly_payment,
    remaining_months,
    start_date,
    due_day,
    status,
    notes
  } = req.body;

  const [result] = await db.query(
    `UPDATE installments
     SET name=?, principal=?, interest_rate=?, monthly_payment=?,
         remaining_months=?, start_date=?, due_day=?, status=?, notes=?
     WHERE id=? AND user_id=?`,
    [
      name,
      principal,
      interest_rate,
      monthly_payment,
      remaining_months,
      start_date,
      due_day,
      status,
      notes,
      id,
      userId
    ]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: 'Installment not found' });
  }

  const [rows] = await db.query(
    'SELECT * FROM installments WHERE id=?',
    [id]
  );
  res.json(rows[0]);
};

exports.remove = async (req, res) => {
  const userId = req.user.userId;
  const id = req.params.id;

  // Soft delete: ubah status ke 'deleted' biar histori tetap ada
  const [result] = await db.query(
    'UPDATE installments SET status="deleted" WHERE id=? AND user_id=?',
    [id, userId]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: 'Installment not found' });
  }
  res.json({ message: 'Installment deleted' });
};
