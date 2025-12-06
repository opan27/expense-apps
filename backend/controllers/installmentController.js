// controllers/installmentController.js
const db = require("../db");
const installmentService = require("../services/installmentService");
const { computeRemainingMonths } = require("../utils/installmentUtils");

// GET semua cicilan milik user (kecuali yang deleted)
exports.getAll = async (req, res) => {
  const userId = req.user.userId;
  const [rows] = await db.query(
    'SELECT * FROM installments WHERE user_id=? AND status <> "deleted"',
    [userId]
  );

  // isi remaining_months kalau di DB masih null (data lama)
  const mapped = rows.map((r) => {
    const dynamicRemaining = computeRemainingMonths(
      r.start_date,
      r.total_months
    );
    return {
      ...r,
      remaining_months: r.remaining_months ?? dynamicRemaining,
    };
  });

  res.json(mapped);
};

// controllers/installmentController.js
exports.getPayments = async (req, res) => {
  const userId = req.user.userId;
  const instId = req.params.id;

  const [rows] = await db.query(
    `SELECT id, amount, DATE_FORMAT(date, '%Y-%m-%d') as date
     FROM expense
     WHERE user_id = ?
       AND installment_id = ?
     ORDER BY date DESC`,
    [userId, instId]
  );

  res.json(rows);
};

// GET satu cicilan by id
exports.getById = async (req, res) => {
  const userId = req.user.userId;
  const id = req.params.id;
  const [rows] = await db.query(
    "SELECT * FROM installments WHERE id=? AND user_id=?",
    [id, userId]
  );
  if (!rows.length)
    return res.status(404).json({ message: "Installment not found" });
  res.json(rows[0]);
};

// GET cicilan H s/d H+10 hari ke depan, yang BELUM dibayar bulan ini
exports.getUpcomingDue = async (req, res) => {
  try {
    const userId = req.user.userId;
    const daysAhead = 10;
    const rows = await installmentService.getUpcomingInstallments(
      userId,
      daysAhead
    );
    res.json(rows);
  } catch (err) {
    console.error("getUpcomingDue error:", err);
    res.status(500).json({ message: "Failed to load upcoming installments" });
  }
};

// CREATE cicilan baru
exports.create = async (req, res) => {
  const userId = req.user.userId;
  const {
    name,
    principal,
    interest_rate,
    monthly_payment,
    total_months,
    start_date,
    due_day,
    notes,
  } = req.body;

  // VALIDASI WAJIB
  if (!total_months || isNaN(total_months)) {
    return res
      .status(400)
      .json({ error: "total_months wajib diisi dan harus angka." });
  }
  if (!monthly_payment) {
    return res.status(400).json({ error: "monthly_payment wajib diisi." });
  }
  if (!principal) {
    return res.status(400).json({ error: "principal wajib diisi." });
  }

  // sisa bulan awal = total_months
  const remaining_months = total_months;

  const [result] = await db.query(
    `INSERT INTO installments
      (user_id, name, principal, interest_rate, monthly_payment,
       total_months, remaining_months, start_date, due_day, status, notes)
     VALUES (?,?,?,?,?,?,?,?,?, 'active', ?)`,
    [
      userId,
      name,
      principal,
      interest_rate || 0,
      monthly_payment,
      total_months,
      remaining_months,
      start_date,
      due_day,
      notes || null,
    ]
  );

  const [rows] = await db.query("SELECT * FROM installments WHERE id=?", [
    result.insertId,
  ]);

  res.status(201).json(rows[0]);
};

// UPDATE cicilan
exports.update = async (req, res) => {
  const userId = req.user.userId;
  const id = req.params.id;
  const {
    name,
    principal,
    interest_rate,
    monthly_payment,
    total_months,
    start_date,
    due_day,
    status,
    notes,
    remaining_months, // diambil dari body
  } = req.body;

  const [result] = await db.query(
    `UPDATE installments
     SET name=?, principal=?, interest_rate=?, monthly_payment=?,
         total_months=?, remaining_months=?, start_date=?, due_day=?, status=?, notes=?
     WHERE id=? AND user_id=?`,
    [
      name,
      principal,
      interest_rate,
      monthly_payment,
      total_months,
      remaining_months,
      start_date,
      due_day,
      status,
      notes,
      id,
      userId,
    ]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: "Installment not found" });
  }

  const [rows] = await db.query("SELECT * FROM installments WHERE id=?", [id]);
  res.json(rows[0]);
};

// SOFT DELETE cicilan
exports.remove = async (req, res) => {
  const userId = req.user.userId;
  const id = req.params.id;

  const [result] = await db.query(
    'UPDATE installments SET status="deleted" WHERE id=? AND user_id=?',
    [id, userId]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: "Installment not found" });
  }
  res.json({ message: "Installment deleted" });
};
