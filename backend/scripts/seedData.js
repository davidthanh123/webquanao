require('dotenv').config(); // Thêm dòng này vào dòng 1
const { randomUUID } = require('crypto');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');
const User = require('../models/User');
const UserAddress = require('../models/UserAddress');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Banner = require('../models/Banner');

async function seed() {
  await sequelize.sync({ force: true });
  console.log('✅ Đã tạo bảng');

  await User.bulkCreate([
    { id: 'u1', name: 'Admin Store', email: 'admin@fashionstore.com',
      password: bcrypt.hashSync('admin123', 10), role: 'admin',
      avatar: '/images/avatars/admin.jpg' },
    { id: 'u2', name: 'Nguyễn Văn A', email: 'user@example.com',
      password: bcrypt.hashSync('user123', 10), role: 'user',
      avatar: '/images/avatars/user.jpg' },
  ]);

  await UserAddress.create({
    id: 'a1', userId: 'u2', name: 'Nguyễn Văn A',
    phone: '0901234567', address: '123 Lê Lợi, Q1, TP.HCM', isDefault: true
  });

  await Category.bulkCreate([
    { id: 'c1', name: 'Áo Nam',    slug: 'ao-nam',    image: '/images/categories/ao-nam.jpg' },
    { id: 'c2', name: 'Quần Nam',  slug: 'quan-nam',  image: '/images/categories/quan-nam.jpg' },
    { id: 'c3', name: 'Áo Nữ',    slug: 'ao-nu',     image: '/images/categories/ao-nu.jpg' },
    { id: 'c4', name: 'Quần Nữ',  slug: 'quan-nu',   image: '/images/categories/quan-nu.jpg' },
    { id: 'c5', name: 'Váy Đầm',  slug: 'vay-dam',   image: '/images/categories/vay-dam.jpg' },
    { id: 'c6', name: 'Phụ Kiện', slug: 'phu-kien',  image: '/images/categories/phu-kien.jpg' },
  ]);

  await Product.bulkCreate([
    { id: 'p1', name: 'Áo Thun Nam Basic Trắng', slug: 'ao-thun-nam-basic-trang',
      categoryId: 'c1', price: 199000, originalPrice: 299000, stock: 100, sold: 520,
      rating: 4.8, reviewCount: 210,
      description: 'Áo thun nam basic chất liệu cotton 100%, thoáng mát, thấm hút mồ hôi tốt.',
      images: ['/images/products/ao-thun-trang-1.jpg', '/images/products/ao-thun-trang-2.jpg', '/images/products/ao-thun-trang-3.jpg'],
      sizes: ['S','M','L','XL','XXL'], colors: ['Trắng','Đen','Xám'], tags: ['bestseller','new'] },

    { id: 'p2', name: 'Quần Jean Nam Slim Fit', slug: 'quan-jean-nam-slim-fit',
      categoryId: 'c2', price: 459000, originalPrice: 650000, stock: 80, sold: 380,
      rating: 4.6, reviewCount: 145,
      description: 'Quần jean nam dáng slim fit, chất liệu denim cao cấp co giãn 4 chiều.',
      images: ['/images/products/quan-jean-nam-1.jpg', '/images/products/quan-jean-nam-2.jpg'],
      sizes: ['28','29','30','31','32','34'], colors: ['Xanh đậm','Xanh nhạt','Đen'], tags: ['sale'] },

    { id: 'p3', name: 'Áo Sơ Mi Nữ Linen Trắng', slug: 'ao-so-mi-nu-linen-trang',
      categoryId: 'c3', price: 329000, originalPrice: 420000, stock: 60, sold: 290,
      rating: 4.9, reviewCount: 180,
      description: 'Áo sơ mi nữ chất linen mềm mại, thanh lịch, phù hợp đi làm và dạo phố.',
      images: ['/images/products/ao-so-mi-nu-1.jpg', '/images/products/ao-so-mi-nu-2.jpg'],
      sizes: ['XS','S','M','L','XL'], colors: ['Trắng','Be','Xanh pastel'], tags: ['new','bestseller'] },

    { id: 'p4', name: 'Váy Maxi Hoa Nhí', slug: 'vay-maxi-hoa-nhi',
      categoryId: 'c5', price: 389000, originalPrice: 520000, stock: 45, sold: 210,
      rating: 4.7, reviewCount: 98,
      description: 'Váy maxi dáng dài họa tiết hoa nhí nhẹ nhàng, nữ tính.',
      images: ['/images/products/vay-maxi-1.jpg', '/images/products/vay-maxi-2.jpg'],
      sizes: ['S','M','L'], colors: ['Hoa đỏ','Hoa xanh','Hoa vàng'], tags: ['sale','new'] },

    { id: 'p5', name: 'Quần Nữ Ống Rộng Linen', slug: 'quan-nu-ong-rong-linen',
      categoryId: 'c4', price: 279000, originalPrice: 380000, stock: 70, sold: 430,
      rating: 4.5, reviewCount: 167,
      description: 'Quần nữ ống rộng chất linen thoáng mát, năng động.',
      images: ['/images/products/quan-nu-1.jpg', '/images/products/quan-nu-2.jpg'],
      sizes: ['XS','S','M','L','XL'], colors: ['Kem','Đen','Nâu'], tags: ['bestseller'] },

    { id: 'p6', name: 'Túi Tote Canvas Thời Trang', slug: 'tui-tote-canvas',
      categoryId: 'c6', price: 149000, originalPrice: 200000, stock: 120, sold: 650,
      rating: 4.8, reviewCount: 302,
      description: 'Túi tote canvas bền đẹp, đựng được nhiều đồ, thích hợp đi học đi làm.',
      images: ['/images/products/tui-tote-1.jpg', '/images/products/tui-tote-2.jpg'],
      sizes: ['Một size'], colors: ['Trắng','Đen','Be','Xanh navy'], tags: ['bestseller','sale'] },
  ]);

  await Banner.bulkCreate([
    { id: 'b1', image: '/images/banners/banner1.jpg', title: 'Bộ Sưu Tập Hè 2025',
      subtitle: 'Giảm đến 50% toàn bộ sản phẩm', link: '/products' },
    { id: 'b2', image: '/images/banners/banner2.jpg', title: 'Thời Trang Nữ Mới Về',
      subtitle: 'Phong cách - Trẻ trung - Hiện đại', link: '/products?category=ao-nu' },
    { id: 'b3', image: '/images/banners/banner3.jpg', title: 'Flash Sale Mỗi Ngày',
      subtitle: 'Săn deal hot lúc 12h và 20h hàng ngày', link: '/flash-sale' },
  ]);

  console.log('✅ Seed data xong!');
  process.exit(0);
}

seed().catch(err => { console.error('❌ Lỗi:', err); process.exit(1); });