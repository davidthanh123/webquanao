// routes/orders.js
const express = require('express');
const { randomUUID: uuidv4 } = require('crypto');
const db = require('../db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const router = express.Router();

// Đặt hàng
router.post('/', authMiddleware, (req, res) => {
  const { items, shippingAddress, paymentMethod, note } = req.body;
  if (!items || items.length === 0) return res.status(400).json({ message: 'Giỏ hàng trống' });

  const orderItems = items.map(item => {
    const product = db.products.find(p => p.id === item.productId);
    if (!product) throw new Error(`Sản phẩm ${item.productId} không tồn tại`);
    return { ...item, productName: product.name, price: product.price, image: product.images[0] };
  });

  const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const total = subtotal + shippingFee;

  const order = {
    id: uuidv4(),
    userId: req.user.id,
    items: orderItems,
    shippingAddress,
    paymentMethod: paymentMethod || 'COD',
    note: note || '',
    subtotal, shippingFee, total,
    status: 'pending', // pending | confirmed | shipping | delivered | cancelled
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.orders.push(order);

  // Xóa giỏ hàng sau khi đặt
  const cart = db.carts.find(c => c.userId === req.user.id);
  if (cart) cart.items = [];

  // Tăng số lượng đã bán
  orderItems.forEach(item => {
    const product = db.products.find(p => p.id === item.productId);
    if (product) product.sold += item.quantity;
  });

  res.status(201).json({ message: 'Đặt hàng thành công!', order });
});

// Lấy đơn hàng của user
router.get('/my-orders', authMiddleware, (req, res) => {
  const orders = db.orders.filter(o => o.userId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(orders);
});

// Chi tiết đơn hàng
router.get('/:id', authMiddleware, (req, res) => {
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
  if (order.userId !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ message: 'Không có quyền xem đơn hàng này' });
  res.json(order);
});

// Hủy đơn hàng
router.put('/:id/cancel', authMiddleware, (req, res) => {
  const order = db.orders.find(o => o.id === req.params.id && o.userId === req.user.id);
  if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
  if (!['pending', 'confirmed'].includes(order.status))
    return res.status(400).json({ message: 'Không thể hủy đơn hàng ở trạng thái này' });
  order.status = 'cancelled';
  order.updatedAt = new Date().toISOString();
  res.json({ message: 'Đã hủy đơn hàng', order });
});

// Admin: Lấy tất cả đơn hàng
router.get('/', adminMiddleware, (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  let orders = [...db.orders];
  if (status) orders = orders.filter(o => o.status === status);
  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const total = orders.length;
  const paginated = orders.slice((page - 1) * limit, page * limit);
  res.json({ orders: paginated, total, page: Number(page), totalPages: Math.ceil(total / limit) });
});

// Admin: Cập nhật trạng thái đơn hàng
router.put('/:id/status', adminMiddleware, (req, res) => {
  const { status } = req.body;
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
  order.status = status;
  order.updatedAt = new Date().toISOString();
  res.json({ message: 'Cập nhật trạng thái thành công', order });
});

module.exports = router;