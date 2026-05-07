require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const productsData = require('./products_clean.json');

// Khớp đúng 18 slugs frontend đang expect
const CATEGORIES = [
  { id: 'c1',  name: 'Áo Thun Nam',   slug: 'ao-thun-nam' },
  { id: 'c2',  name: 'Áo Sơ Mi Nam',  slug: 'ao-so-mi-nam' },
  { id: 'c3',  name: 'Quần Nam',       slug: 'quan-nam' },
  { id: 'c4',  name: 'Áo Khoác Nam',  slug: 'ao-khoac-nam' },
  { id: 'c5',  name: 'Áo Thun Nữ',    slug: 'ao-thun-nu' },
  { id: 'c6',  name: 'Áo Sơ Mi Nữ',   slug: 'ao-so-mi-nu' },
  { id: 'c7',  name: 'Quần Nữ',        slug: 'quan-nu' },
  { id: 'c8',  name: 'Váy',            slug: 'vay' },
  { id: 'c9',  name: 'Áo Khoác Nữ',   slug: 'ao-khoac-nu' },
  { id: 'c10', name: 'Đầm Nữ',         slug: 'dam-nu' },
  { id: 'c11', name: 'Áo Trẻ Em',      slug: 'ao-tre-em' },
  { id: 'c12', name: 'Quần Trẻ Em',    slug: 'quan-tre-em' },
  { id: 'c13', name: 'Đầm Bé Gái',     slug: 'dam-be-gai' },
  { id: 'c14', name: 'Túi Xách',        slug: 'tui-xach' },
  { id: 'c15', name: 'Giày Nam',        slug: 'giay-nam' },
  { id: 'c16', name: 'Giày Nữ',         slug: 'giay-nu' },
  { id: 'c17', name: 'Phụ Kiện',        slug: 'phu-kien' },
  { id: 'c18', name: 'Đồ Thể Thao',    slug: 'do-the-thao' },
];

// Map category_id từ products_clean.json → category id mới
const CAT_MAP = {
  'c_ao_nam':    ['c1', 'c2'],       // Áo Nam → Áo Thun Nam + Áo Sơ Mi Nam
  'c_quan_nam':  ['c3'],
  'c_ao_nu':     ['c5', 'c6'],       // Áo Nữ → Áo Thun Nữ + Áo Sơ Mi Nữ
  'c_quan_nu':   ['c7'],
  'c_vay_dam':   ['c8', 'c10'],      // Váy Đầm → Váy + Đầm Nữ
  'c_ao_khoac':  ['c4', 'c9'],       // Áo Khoác → Nam + Nữ (random)
  'c_the_thao':  ['c18'],
  'c_phu_kien':  ['c17'],
};

function pickCategory(cat_id, index) {
  const options = CAT_MAP[cat_id] || ['c1'];
  return options[index % options.length];
}

function makeSlug(title, id) {
  return title
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 50) + '-' + id.slice(0, 8);
}

async function seed() {
  try {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await sequelize.sync({ force: true });
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ 1. Tạo bảng xong.');

    const salt = await bcrypt.genSalt(10);
    await User.create({
      id: 'u1', name: 'Admin', email: 'admin@fashionstore.com',
      password: await bcrypt.hash('admin123', salt), role: 'admin'
    });
    console.log('✅ 2. Tạo admin xong.');

    await Category.bulkCreate(CATEGORIES);
    console.log('✅ 3. Tạo 18 categories xong.');

    let ok = 0;
    for (let i = 0; i < productsData.length; i++) {
      const p = productsData[i];
      const id = `sp${i}x${Date.now()}`.slice(0, 20);
      try {
        await Product.create({
          id,
          name: p.title.slice(0, 255),
          slug: makeSlug(p.title, id),
          price: Math.round(p.price),
          originalPrice: Math.round(p.price * 1.2),
          description: p.title.slice(0, 1000),
          images: p.images,
          sizes: ['S', 'M', 'L', 'XL'],
          colors: ['Mặc định'],
          stock: Math.floor(Math.random() * 100) + 10,
          sold: p.sold || 0,
          rating: p.rating || 0,
          reviewCount: 0,
          tags: [],
          categoryId: pickCategory(p.category_id, i),
        });
        ok++;
        if (ok % 50 === 0) console.log(`  → Đã insert ${ok}/${productsData.length}`);
      } catch (e) {
        // bỏ qua lỗi slug trùng
      }
    }

    console.log(`\n🎉 Seed xong! ${ok} sản phẩm, 18 categories.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
    process.exit(1);
  }
}

seed();