const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  try {
    await db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hash]);
    res.json({ message: 'Registrasi sukses' });
  } catch (e) {
    res.status(400).json({ error: 'Email sudah digunakan' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const [users] = await db.query('SELECT * FROM users WHERE email=?', [email]);
  if (users.length === 0) return res.status(401).json({ error: 'User tidak ditemukan' });
  const valid = await bcrypt.compare(password, users[0].password);
  if (!valid) return res.status(401).json({ error: 'Password salah' });
  const token = jwt.sign({ userId: users[0].id, email: users[0].email }, JWT_SECRET, { expiresIn: '1d' });
  res.json({ message: 'Login sukses', token });
};
