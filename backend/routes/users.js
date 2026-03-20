// routes/users.js
const express = require('express');
const db = require('../db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const router = express.Router();

// Cập nhật profile
router.put('/profile', authMiddleware, (req, res) => {
  const { name, phone, avatar } = req.body;
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (avatar) user.avatar = avatar; // 📷 ẢNH: URL avatar mới của user
  const { password: _, ...userWithoutPassword } = user;
  res.json({ message: 'Cập nhật thành công', user: userWithoutPassword });
});

// Thêm địa chỉ
router.post('/address', authMiddleware, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  const { name, phone, address, isDefault } = req.body;
  const { v4: uuidv4 } = require('uuid');
  if (isDefault) user.address.forEach(a => a.isDefault = false);
  user.address.push({ id: uuidv4(), name, phone, address, isDefault: isDefault || false });
  res.json({ message: 'Đã thêm địa chỉ', addresses: user.address });
});

// Xóa địa chỉ
router.delete('/address/:id', authMiddleware, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  user.address = user.address.filter(a => a.id !== req.params.id);
  res.json({ message: 'Đã xóa địa chỉ' });
});

// Admin: Lấy tất cả users
router.get('/', adminMiddleware, (req, res) => {
  const users = db.users.map(({ password: _, ...u }) => u);
  res.json(users);
});

module.exports = router;