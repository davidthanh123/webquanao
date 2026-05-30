// server.js - Main backend server
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const cartRoutes = require('./routes/cart');
const userRoutes = require('./routes/users');
const bannerRoutes = require('./routes/banners');

// ============ DATABASE + MODELS ============
const sequelize = require('./config/database');
const Product     = require('./models/Product');
const Category    = require('./models/Category');
const Review      = require('./models/Review');
const User        = require('./models/User');
const UserAddress = require('./models/UserAddress');

// Quan hệ giữa các bảng
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Review.belongsTo(User,      { foreignKey: 'userId',     as: 'user' });
User.hasMany(UserAddress,   { foreignKey: 'userId',     as: 'addresses' });

// Kết nối MySQL và tạo bảng nếu chưa có
sequelize.authenticate()
  .then(() => {
    console.log('✅ Kết nối MySQL thành công!');
    return sequelize.sync({ alter: false }); // Tạo bảng nếu chưa có, không xóa data cũ
  })
  .then(() => console.log('✅ Sync bảng thành công!'))
  .catch(err => console.error('❌ Lỗi kết nối MySQL:', err));
// ==========================================

const app = express();
const PORT = process.env.PORT || 5000;


// Middleware
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || origin.includes('vercel.app') || origin.includes('localhost')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

const session = require('express-session');
const passport = require('./middleware/passport');

app.use(session({ secret: process.env.SESSION_SECRET || 'fashionstore_secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());


// 📷 Serve static images - đặt tất cả ảnh vào thư mục /backend/public/images/
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/users', userRoutes);
app.use('/api/banners', bannerRoutes);

// Proxy ảnh Shopee — có validation chống trả ảnh sai
const https = require('https');
const http = require('http');

app.get('/api/proxy-image', (req, res) => {
  const imageUrl = req.query.url;
  if (!imageUrl) return res.status(400).send('Missing url');

  // Chỉ cho phép domain ảnh hợp lệ (chặn SSRF)
  const allowedHosts = ['susercontent.com', 'shopee.vn', 'cf.shopee.vn', 'down-vn.img.susercontent.com'];
  try {
    const hostname = new URL(imageUrl).hostname;
    const isAllowed = allowedHosts.some(h => hostname.endsWith(h));
    if (!isAllowed) return res.status(403).send('Domain not allowed');
  } catch {
    return res.status(400).send('Invalid URL');
  }

  const protocol = imageUrl.startsWith('https') ? https : http;
  const request = protocol.get(imageUrl, {
    headers: {
      'Referer': 'https://shopee.vn',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    timeout: 10000,
  }, (imgRes) => {
    // Follow redirect
    if (imgRes.statusCode === 301 || imgRes.statusCode === 302) {
      return res.redirect(imgRes.headers.location);
    }
    // ✅ Validate status
    if (imgRes.statusCode !== 200) {
      imgRes.resume();
      return res.status(404).send('Image not found');
    }
    // ✅ Validate content-type phải là image/*
    const contentType = imgRes.headers['content-type'] || '';
    if (!contentType.startsWith('image/')) {
      imgRes.resume();
      return res.status(404).send('Not an image');
    }
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=604800'); // cache 7 ngày
    imgRes.pipe(res);
  });

  request.on('error', () => res.status(404).send('Image fetch failed'));
  request.on('timeout', () => { request.destroy(); res.status(504).send('Timeout'); });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Fashion Store API đang chạy!' });
});

app.listen(PORT, () => {
  console.log(`✅ Backend server chạy tại http://localhost:${PORT}`);
  console.log(`📷 Ảnh được serve từ: http://localhost:${PORT}/images/`);
});