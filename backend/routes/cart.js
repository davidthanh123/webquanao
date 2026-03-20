// routes/cart.js
const express = require('express');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// Lấy giỏ hàng
router.get('/', authMiddleware, (req, res) => {
  const cart = db.carts.find(c => c.userId === req.user.id) || { userId: req.user.id, items: [] };
  const enriched = cart.items.map(item => {
    const product = db.products.find(p => p.id === item.productId);
    return product ? { ...item, product } : null;
  }).filter(Boolean);
  res.json({ items: enriched });
});

// Thêm vào giỏ hàng
router.post('/add', authMiddleware, (req, res) => {
  const { productId, quantity, size, color } = req.body;
  const product = db.products.find(p => p.id === productId);
  if (!product) return res.status(404).json({ message: 'Sản phẩm không tồn tại' });

  let cart = db.carts.find(c => c.userId === req.user.id);
  if (!cart) { cart = { userId: req.user.id, items: [] }; db.carts.push(cart); }

  const existingIdx = cart.items.findIndex(i => i.productId === productId && i.size === size && i.color === color);
  if (existingIdx >= 0) {
    cart.items[existingIdx].quantity += quantity;
  } else {
    cart.items.push({ productId, quantity, size, color });
  }
  res.json({ message: 'Đã thêm vào giỏ hàng', cart });
});

// Cập nhật số lượng
router.put('/update', authMiddleware, (req, res) => {
  const { productId, quantity, size, color } = req.body;
  const cart = db.carts.find(c => c.userId === req.user.id);
  if (!cart) return res.status(404).json({ message: 'Giỏ hàng trống' });

  const idx = cart.items.findIndex(i => i.productId === productId && i.size === size && i.color === color);
  if (idx === -1) return res.status(404).json({ message: 'Sản phẩm không có trong giỏ' });

  if (quantity <= 0) cart.items.splice(idx, 1);
  else cart.items[idx].quantity = quantity;
  res.json({ message: 'Đã cập nhật giỏ hàng', cart });
});

// Xóa khỏi giỏ
router.delete('/remove', authMiddleware, (req, res) => {
  const { productId, size, color } = req.body;
  const cart = db.carts.find(c => c.userId === req.user.id);
  if (!cart) return res.status(404).json({ message: 'Giỏ hàng trống' });
  cart.items = cart.items.filter(i => !(i.productId === productId && i.size === size && i.color === color));
  res.json({ message: 'Đã xóa khỏi giỏ hàng' });
});

module.exports = router;