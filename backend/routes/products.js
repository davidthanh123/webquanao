// routes/products.js — Dùng MySQL qua Sequelize (không còn db.js)
const express = require('express');
const { randomUUID: uuidv4 } = require('crypto');
const { Op } = require('sequelize');
const Product  = require('../models/Product');
const Category = require('../models/Category');
const Review   = require('../models/Review');
const User     = require('../models/User');
const { adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// ─── Helper: parse JSON string fields từ MySQL ────────────────────────────────
function parseProduct(p) {
  const obj = p.toJSON ? p.toJSON() : { ...p };
  ['images', 'sizes', 'colors', 'tags'].forEach(field => {
    if (typeof obj[field] === 'string') {
      try { obj[field] = JSON.parse(obj[field]); } catch { obj[field] = []; }
    }
  });
  return obj;
}

// ─── GET /api/products — Lấy danh sách (filter, search, sort, phân trang) ────
router.get('/', async (req, res) => {
  try {
    let { category, search, sort, minPrice, maxPrice, page = 1, limit = 12, tag } = req.query;
    page  = Number(page)  || 1;
    limit = Number(limit) || 12;

    const where = {};

    // Filter theo category (slug hoặc id)
    if (category) {
      const cat = await Category.findOne({
        where: { [Op.or]: [{ slug: category }, { id: category }] }
      });
      if (cat) where.categoryId = cat.id;
      else return res.json({ products: [], total: 0, page, totalPages: 0 });
    }

    // Search tên sản phẩm
    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }

    // Filter giá
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = Number(minPrice);
      if (maxPrice) where.price[Op.lte] = Number(maxPrice);
    }

    // Filter tag (JSON string chứa array)
    if (tag) {
      where.tags = { [Op.like]: `%${tag}%` };
    }

    // Sort
    let order = [['createdAt', 'DESC']];
    if (sort === 'price_asc')  order = [['price', 'ASC']];
    if (sort === 'price_desc') order = [['price', 'DESC']];
    if (sort === 'bestseller') order = [['sold', 'DESC']];
    if (sort === 'rating')     order = [['rating', 'DESC']];
    if (sort === 'newest')     order = [['createdAt', 'DESC']];

    const { count, rows } = await Product.findAndCountAll({
      where,
      order,
      limit,
      offset: (page - 1) * limit,
    });

    // Lấy tên category cho từng sản phẩm
    const catIds = [...new Set(rows.map(p => p.categoryId))];
    const cats   = await Category.findAll({ where: { id: catIds } });
    const catMap = Object.fromEntries(cats.map(c => [c.id, c.name]));

    const products = rows.map(p => ({
      ...parseProduct(p),
      categoryName: catMap[p.categoryId] || '',
    }));

    res.json({ products, total: count, page, totalPages: Math.ceil(count / limit) });
  } catch (err) {
    console.error('GET /products error:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// ─── GET /api/products/meta/categories — Phải đặt TRƯỚC /:slug ───────────────
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [['id', 'ASC']] });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// ─── GET /api/products/:slug — Chi tiết sản phẩm ─────────────────────────────
router.get('/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { [Op.or]: [{ slug: req.params.slug }, { id: req.params.slug }] }
    });
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });

    const category = await Category.findByPk(product.categoryId);

    // Lấy reviews kèm thông tin user
    const reviews = await Review.findAll({
      where: { productId: product.id },
      include: [{ model: User, as: 'user', attributes: ['name', 'avatar'] }],
      order: [['createdAt', 'DESC']],
    });

    const reviewsData = reviews.map(r => {
      const obj = r.toJSON();
      return {
        ...obj,
        userName:   obj.user?.name   || 'Ẩn danh',
        userAvatar: obj.user?.avatar || null,
      };
    });

    res.json({
      ...parseProduct(product),
      categoryName: category?.name || '',
      reviews: reviewsData,
    });
  } catch (err) {
    console.error('GET /products/:slug error:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// ─── POST /api/products — Thêm sản phẩm (admin) ──────────────────────────────
router.post('/', adminMiddleware, async (req, res) => {
  try {
    const body = { ...req.body };
    // Stringify arrays nếu frontend gửi lên dạng array
    ['images', 'sizes', 'colors', 'tags'].forEach(f => {
      if (Array.isArray(body[f])) body[f] = JSON.stringify(body[f]);
    });

    const product = await Product.create({
      id: uuidv4(),
      sold: 0,
      rating: 0,
      reviewCount: 0,
      ...body,
    });
    res.status(201).json(parseProduct(product));
  } catch (err) {
    res.status(500).json({ message: 'Lỗi tạo sản phẩm', error: err.message });
  }
});

// ─── PUT /api/products/:id — Cập nhật (admin) ────────────────────────────────
router.put('/:id', adminMiddleware, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });

    const body = { ...req.body };
    ['images', 'sizes', 'colors', 'tags'].forEach(f => {
      if (Array.isArray(body[f])) body[f] = JSON.stringify(body[f]);
    });

    await product.update(body);
    res.json(parseProduct(product));
  } catch (err) {
    res.status(500).json({ message: 'Lỗi cập nhật sản phẩm', error: err.message });
  }
});

// ─── DELETE /api/products/:id — Xóa (admin) ──────────────────────────────────
router.delete('/:id', adminMiddleware, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    await product.destroy();
    res.json({ message: 'Đã xóa sản phẩm' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi xóa sản phẩm', error: err.message });
  }
});

// ─── POST /api/products/:id/reviews — Thêm đánh giá ─────────────────────────
router.post('/:id/reviews', async (req, res) => {
  try {
    const { userId, rating, comment } = req.body;
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });

    const review = await Review.create({
      id: uuidv4(),
      productId: req.params.id,
      userId,
      rating,
      comment,
    });

    // Cập nhật rating trung bình
    const allReviews = await Review.findAll({ where: { productId: req.params.id } });
    const avgRating  = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await product.update({
      rating:      Number(avgRating.toFixed(1)),
      reviewCount: allReviews.length,
    });

    res.status(201).json(review.toJSON());
  } catch (err) {
    res.status(500).json({ message: 'Lỗi thêm đánh giá', error: err.message });
  }
});

module.exports = router;