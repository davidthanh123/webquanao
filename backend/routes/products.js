// routes/products.js — Fix lỗi Table 'railway.reviews' doesn't exist
const express = require('express');
const { randomUUID: uuidv4 } = require('crypto');
const { Op, QueryTypes } = require('sequelize');
const Product  = require('../models/Product');
const Category = require('../models/Category');
const { adminMiddleware } = require('../middleware/auth');

// ── Import có guard: nếu model chưa tồn tại thì không crash ──────────────────
let Review, User;
try {
  Review = require('../models/Review');
  User   = require('../models/User');
} catch (e) {
  console.warn('⚠️  Review/User model không tồn tại, bỏ qua reviews');
}

const router = express.Router();

// ── Helper: kiểm tra bảng reviews có tồn tại không ───────────────────────────
async function reviewsTableExists() {
  if (!Review) return false;
  try {
    await Review.findOne({ limit: 1 });
    return true;
  } catch (e) {
    return false;
  }
}

// ─── Helper: parse JSON string fields từ MySQL ────────────────────────────────
function parseProduct(p) {
  const obj = p.toJSON ? p.toJSON() : { ...p };
  ['images', 'sizes', 'colors', 'tags'].forEach(field => {
    if (typeof obj[field] === 'string') {
      try { obj[field] = JSON.parse(obj[field]); } catch { obj[field] = []; }
    }
    if (!Array.isArray(obj[field])) obj[field] = [];
  });
  return obj;
}

// ─── GET /api/products — Lấy danh sách ───────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    let { category, search, sort, minPrice, maxPrice, page = 1, limit = 12, tag } = req.query;
    page  = Number(page)  || 1;
    limit = Number(limit) || 12;

    const where = {};

    if (category) {
  const cat = await Category.findOne({
    where: { [Op.or]: [{ slug: category }, { id: category }] }
  });
  if (!cat) return res.json({ products: [], total: 0, page, totalPages: 0 });

  // Map category cha → các slug con
  const childrenMap = {
    'ao-nam':       ['ao-thun-nam', 'ao-so-mi-nam', 'ao-khoac-nam'],
    'ao-nu':        ['ao-thun-nu',  'ao-so-mi-nu',  'ao-khoac-nu'],
    'vay-dam':      ['quan-nu', 'vay', 'dam-nu'],
    'quan-nam-cha': ['quan-nam'],
    'phu-kien-cha': ['tui-xach', 'giay-nam', 'giay-nu', 'phu-kien'],
  };

  if (childrenMap[cat.slug]) {
    const childCats = await Category.findAll({
      where: { slug: { [Op.in]: childrenMap[cat.slug] } }
    });
    const childIds = childCats.map(c => c.id);
    where.categoryId = { [Op.in]: childIds };
  } else {
    where.categoryId = cat.id;
  }
}

    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = Number(minPrice);
      if (maxPrice) where.price[Op.lte] = Number(maxPrice);
    }

    if (tag) {
      where.tags = { [Op.like]: `%${tag}%` };
    }

    let order = [['createdAt', 'DESC']];
    if (sort === 'price_asc')  order = [['price', 'ASC']];
    if (sort === 'price_desc') order = [['price', 'DESC']];
    if (sort === 'bestseller') order = [['sold', 'DESC']];
    if (sort === 'rating')     order = [['rating', 'DESC']];
    if (sort === 'newest')     order = [['createdAt', 'DESC']];

    const { count, rows } = await Product.findAndCountAll({
      where, order, limit, offset: (page - 1) * limit,
    });

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

// ─── GET /api/products/meta/categories ───────────────────────────────────────
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

    // ── FIX: chỉ query reviews nếu bảng tồn tại ──────────────────────────────
    let reviewsData = [];
    const hasReviews = await reviewsTableExists();

    if (hasReviews) {
      try {
        // Include User chỉ khi User model có sẵn
        const includeOpts = User
          ? [{ model: User, as: 'user', attributes: ['name', 'avatar'] }]
          : [];

        const reviews = await Review.findAll({
          where: { productId: product.id },
          include: includeOpts,
          order: [['createdAt', 'DESC']],
        });

        reviewsData = reviews.map(r => {
          const obj = r.toJSON();
          return {
            ...obj,
            userName:   obj.user?.name   || 'Ẩn danh',
            userAvatar: obj.user?.avatar || null,
          };
        });
      } catch (reviewErr) {
        console.warn('⚠️  Lỗi khi lấy reviews:', reviewErr.message);
        // Không crash, trả về mảng rỗng
      }
    }

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
    ['images', 'sizes', 'colors', 'tags'].forEach(f => {
      if (Array.isArray(body[f])) body[f] = JSON.stringify(body[f]);
    });
    const product = await Product.create({ id: uuidv4(), sold: 0, rating: 0, reviewCount: 0, ...body });
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

// ─── DELETE /api/products/:id ─────────────────────────────────────────────────
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

// ─── POST /api/products/:id/reviews ──────────────────────────────────────────
router.post('/:id/reviews', async (req, res) => {
  try {
    const hasReviews = await reviewsTableExists();
    if (!hasReviews) {
      return res.status(503).json({ message: 'Tính năng đánh giá chưa khả dụng' });
    }

    const { userId, rating, comment } = req.body;
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });

    const review = await Review.create({
      id: uuidv4(), productId: req.params.id, userId, rating, comment,
    });

    const allReviews = await Review.findAll({ where: { productId: req.params.id } });
    const avgRating  = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await product.update({ rating: Number(avgRating.toFixed(1)), reviewCount: allReviews.length });

    res.status(201).json(review.toJSON());
  } catch (err) {
    res.status(500).json({ message: 'Lỗi thêm đánh giá', error: err.message });
  }
});

module.exports = router;