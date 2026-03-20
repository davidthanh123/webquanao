// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { JWT_SECRET, authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Đăng ký
router.post('/register', async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
  if (db.users.find(u => u.email === email)) return res.status(400).json({ message: 'Email đã tồn tại' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: uuidv4(),
    name, email, phone: phone || '',
    password: hashedPassword,
    role: 'user',
    avatar: null,
    address: [],
    createdAt: new Date().toISOString()
  };
  db.users.push(newUser);
  const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json({ message: 'Đăng ký thành công!', token, user: userWithoutPassword });
});

// Đăng nhập
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(u => u.email === email);
  if (!user) return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  const { password: _, ...userWithoutPassword } = user;
  res.json({ message: 'Đăng nhập thành công!', token, user: userWithoutPassword });
});

// Lấy thông tin user hiện tại
router.get('/me', authMiddleware, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });
  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

module.exports = router;