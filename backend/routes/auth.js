// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID: uuidv4 } = require('crypto');
const db = require('../db');
const { JWT_SECRET, authMiddleware } = require('../middleware/auth');
const passport = require('../middleware/passport');

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

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: 'https://webquanao-seven.vercel.app/login?error=1' }),
  (req, res) => {
    const token = jwt.sign({ id: req.user.id, email: req.user.email, role: req.user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.redirect(`https://webquanao-seven.vercel.app/oauth-callback?token=${token}`);
  }
);

// Facebook OAuth
router.get('/facebook', passport.authenticate('facebook', { scope: ['public_profile', 'email'] }));
router.get('/facebook/callback',
  passport.authenticate('facebook', { session: false, failureRedirect: 'https://webquanao-seven.vercel.app/login?error=1' }),
  (req, res) => {
    const token = jwt.sign({ id: req.user.id, email: req.user.email, role: req.user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.redirect(`https://webquanao-seven.vercel.app/oauth-callback?token=${token}`);
  }
);

module.exports = router;