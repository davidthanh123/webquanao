// routes/products.js
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Lấy tất cả sản phẩm (có filter, search, sort, phân trang)
router.get('/', (req, res) => {
  let { category, search, sort, minPrice, maxPrice, page = 1, limit = 12, tag } = req.query;
  let products = [...db.products];

  if (category) products = products.filter(p => {
    const cat = db.categories.find(c => c.slug === category || c.id === category);
    return cat ? p.categoryId === cat.id : false;
  });
  if (search) products = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  if (minPrice) products = products.filter(p => p.price >= Number(minPrice));
  if (maxPrice) products = products.filter(p => p.price <= Number(maxPrice));
  if (tag) products = products.filter(p => p.tags?.includes(tag));

  if (sort === 'price_asc') products.sort((a, b) => a.price - b.price);
  else if (sort === 'price_desc') products.sort((a, b) => b.price - a.price);
  else if (sort === 'bestseller') products.sort((a, b) => b.sold - a.sold);
  else if (sort === 'rating') products.sort((a, b) => b.rating - a.rating);
  else if (sort === 'newest') products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const total = products.length;
  const start = (page - 1) * limit;
  const paginated = products.slice(start, start + Number(limit));

  // Gắn category name vào từng sản phẩm
  const enriched = paginated.map(p => ({
    ...p,
    categoryName: db.categories.find(c => c.id === p.categoryId)?.name || ''
  }));

  res.json({ products: enriched, total, page: Number(page), totalPages: Math.ceil(total / limit) });
});

// Lấy chi tiết sản phẩm
router.get('/:slug', (req, res) => {
  const product = db.products.find(p => p.slug === req.params.slug || p.id === req.params.slug);
  if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });

  const reviews = db.reviews.filter(r => r.productId === product.id).map(r => {
    const user = db.users.find(u => u.id === r.userId);
    return { ...r, userName: user?.name || 'Ẩn danh', userAvatar: user?.avatar || null };
  });

  res.json({ ...product, categoryName: db.categories.find(c => c.id === product.categoryId)?.name || '', reviews });
});

// Thêm sản phẩm (admin)
router.post('/', adminMiddleware, (req, res) => {
  const product = { id: uuidv4(), ...req.body, sold: 0, rating: 0, reviewCount: 0, createdAt: new Date().toISOString() };
  db.products.push(product);
  res.status(201).json(product);
});

// Cập nhật sản phẩm (admin)
router.put('/:id', adminMiddleware, (req, res) => {
  const idx = db.products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
  db.products[idx] = { ...db.products[idx], ...req.body };
  res.json(db.products[idx]);
});

// Xóa sản phẩm (admin)
router.delete('/:id', adminMiddleware, (req, res) => {
  const idx = db.products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
  db.products.splice(idx, 1);
  res.json({ message: 'Đã xóa sản phẩm' });
});

// Thêm đánh giá
router.post('/:id/reviews', (req, res) => {
  const { userId, rating, comment } = req.body;
  const product = db.products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });

  const review = { id: uuidv4(), productId: req.params.id, userId, rating, comment, createdAt: new Date().toISOString() };
  db.reviews.push(review);

  // Cập nhật rating trung bình
  const productReviews = db.reviews.filter(r => r.productId === req.params.id);
  product.rating = Number((productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1));
  product.reviewCount = productReviews.length;

  res.status(201).json(review);
});

// Lấy danh mục
router.get('/meta/categories', (req, res) => {
  res.json(db.categories);
});

module.exports = router;