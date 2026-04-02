// server.js - Main backend server
const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const cartRoutes = require('./routes/cart');
const userRoutes = require('./routes/users');
const bannerRoutes = require('./routes/banners');

const app = express();
const PORT = process.env.PORT || 5000;


// Middleware
app.use(cors({
  origin: [
    'https://webquanao.vercel.app',
    'https://webquanao-seven.vercel.app',
    'http://localhost:3000'
  ],
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Fashion Store API đang chạy!' });
});

app.listen(PORT, () => {
  console.log(`✅ Backend server chạy tại http://localhost:${PORT}`);
  console.log(`📷 Ảnh được serve từ: http://localhost:${PORT}/images/`);
});