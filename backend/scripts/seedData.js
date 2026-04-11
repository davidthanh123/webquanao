require('dotenv').config();
const sequelize = require('../config/database');
const User = require('../models/User');
const UserAddress = require('../models/UserAddress');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Banner = require('../models/Banner');
const bcrypt = require('bcryptjs');

// 🟢 Nạp 1000 sản phẩm từ file JSON (images/sizes/colors/tags đã stringify sẵn)
const productsData = require('./products_data.json');

async function seed() {
  await sequelize.sync({ force: true });
  console.log('✅ Đã xóa trắng và tạo lại các bảng');

  // 1. Users
  await User.bulkCreate([
    { id: 'u1', name: 'Admin Store', email: 'admin@fashionstore.com', password: bcrypt.hashSync('admin123', 10), role: 'admin', avatar: '/images/avatars/admin.jpg' },
    { id: 'u2', name: 'Nguyễn Văn A', email: 'user@example.com', password: bcrypt.hashSync('user123', 10), role: 'user', avatar: '/images/avatars/user.jpg' },
  ]);
  await UserAddress.create({ id: 'a1', userId: 'u2', name: 'Nguyễn Văn A', phone: '0901234567', address: '123 Lê Lợi, Q1, TP.HCM', isDefault: true });
  console.log('✅ Users + Address');

  // 2. Categories — 18 danh mục khớp với products_data.json
  await Category.bulkCreate([
    { id: 'c1',  name: 'Áo Thun Nam',   slug: 'ao-thun-nam',  image: '/images/categories/ao-thun-nam.jpg' },
    { id: 'c2',  name: 'Áo Sơ Mi Nam', slug: 'ao-so-mi-nam', image: '/images/categories/ao-so-mi-nam.jpg' },
    { id: 'c3',  name: 'Quần Nam',      slug: 'quan-nam',     image: '/images/categories/quan-nam.jpg' },
    { id: 'c4',  name: 'Áo Khoác Nam', slug: 'ao-khoac-nam', image: '/images/categories/ao-khoac-nam.jpg' },
    { id: 'c5',  name: 'Áo Thun Nữ',   slug: 'ao-thun-nu',   image: '/images/categories/ao-thun-nu.jpg' },
    { id: 'c6',  name: 'Áo Sơ Mi Nữ', slug: 'ao-so-mi-nu',  image: '/images/categories/ao-so-mi-nu.jpg' },
    { id: 'c7',  name: 'Quần Nữ',      slug: 'quan-nu',      image: '/images/categories/quan-nu.jpg' },
    { id: 'c8',  name: 'Váy',          slug: 'vay',          image: '/images/categories/vay.jpg' },
    { id: 'c9',  name: 'Áo Khoác Nữ', slug: 'ao-khoac-nu',  image: '/images/categories/ao-khoac-nu.jpg' },
    { id: 'c10', name: 'Đầm Nữ',       slug: 'dam-nu',       image: '/images/categories/dam-nu.jpg' },
    { id: 'c11', name: 'Áo Trẻ Em',    slug: 'ao-tre-em',    image: '/images/categories/ao-tre-em.jpg' },
    { id: 'c12', name: 'Quần Trẻ Em',  slug: 'quan-tre-em',  image: '/images/categories/quan-tre-em.jpg' },
    { id: 'c13', name: 'Đầm Bé Gái',  slug: 'dam-be-gai',   image: '/images/categories/dam-be-gai.jpg' },
    { id: 'c14', name: 'Túi Xách',     slug: 'tui-xach',     image: '/images/categories/tui-xach.jpg' },
    { id: 'c15', name: 'Giày Nam',     slug: 'giay-nam',     image: '/images/categories/giay-nam.jpg' },
    { id: 'c16', name: 'Giày Nữ',     slug: 'giay-nu',      image: '/images/categories/giay-nu.jpg' },
    { id: 'c17', name: 'Phụ Kiện',     slug: 'phu-kien',     image: '/images/categories/phu-kien.jpg' },
    { id: 'c18', name: 'Đồ Thể Thao', slug: 'do-the-thao',  image: '/images/categories/do-the-thao.jpg' },
  ]);
  console.log('✅ Categories (18 danh mục)');

  // 3. Products — chia batch 100 tránh timeout
  console.log(`⏳ Đang nạp ${productsData.length} sản phẩm...`);
  const BATCH = 100;
  for (let i = 0; i < productsData.length; i += BATCH) {
    await Product.bulkCreate(productsData.slice(i, i + BATCH));
    console.log(`  → ${Math.min(i + BATCH, productsData.length)} / ${productsData.length}`);
  }
  console.log('✅ Products');

  // 4. Banners
  await Banner.bulkCreate([
    { id: 'b1', image: '/images/banners/banner1.jpg', title: 'Bộ Sưu Tập Hè 2025', subtitle: 'Giảm đến 50% toàn bộ sản phẩm', link: '/products' },
    { id: 'b2', image: '/images/banners/banner2.jpg', title: 'Thời Trang Nữ Mới Về', subtitle: 'Phong cách - Trẻ trung - Hiện đại', link: '/products?category=ao-thun-nu' },
    { id: 'b3', image: '/images/banners/banner3.jpg', title: 'Flash Sale Mỗi Ngày', subtitle: 'Săn deal hot lúc 12h và 20h hàng ngày', link: '/flash-sale' },
  ]);
  console.log('✅ Banners');

  console.log('\n🎉 1000 sản phẩm đã yên vị trên MySQL Railway!');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Lỗi seed:', err.message || err);
  process.exit(1);
});