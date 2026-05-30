// backend/scripts/uploadToCloudinary.js
// Chạy: node scripts/uploadToCloudinary.js
// Tác dụng: Upload toàn bộ ảnh local (public/images/products) lên Cloudinary
//           và cập nhật DB bằng URL Cloudinary vĩnh viễn

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

const sequelize = require('../config/database');
const Product = require('../models/Product');

// Config Cloudinary
cloudinary.config({
  cloud_name: 'dknwxieb8',
  api_key: '946117827628216',
  api_secret: 'UKwFnI9wtaRElacWmxKH9HL5Tcc',
});

const IMG_DIR = path.join(__dirname, '../public/images/products');

// Upload 1 file local lên Cloudinary
function uploadToCloud(filePath, publicId) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(filePath, {
      public_id: publicId,
      folder: 'webquanao/products',
      overwrite: false, // Không upload lại nếu đã tồn tại
      resource_type: 'image',
    }, (err, result) => {
      if (err) return reject(err);
      resolve(result.secure_url); // https://res.cloudinary.com/...
    });
  });
}

// Kiểm tra URL đã là Cloudinary chưa
function isCloudinaryUrl(url) {
  return url && url.includes('cloudinary.com');
}

// Lấy tên file từ đường dẫn local (/images/products/abc.jpg → abc)
function getPublicId(localPath) {
  return path.basename(localPath, path.extname(localPath));
}

async function main() {
  await sequelize.authenticate();
  console.log('✅ Kết nối DB thành công\n');

  const products = await Product.findAll();
  console.log(`📦 Tổng ${products.length} sản phẩm\n`);

  let updated = 0, skipped = 0, failed = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const images = Array.isArray(p.images) ? p.images : [];
    let changed = false;
    const newImages = [];

    for (let j = 0; j < images.length; j++) {
      const url = images[j];

      // Bỏ qua nếu đã là Cloudinary URL
      if (isCloudinaryUrl(url)) {
        newImages.push(url);
        continue;
      }

      // Chỉ xử lý ảnh local (/images/products/...)
      if (!url.startsWith('/images/products/')) {
        newImages.push(url);
        continue;
      }

      const localFile = path.join(IMG_DIR, path.basename(url));

      // Kiểm tra file có tồn tại không
      if (!fs.existsSync(localFile)) {
        console.warn(`  ⚠️  File không tồn tại: ${localFile}`);
        newImages.push(url);
        failed++;
        continue;
      }

      try {
        const publicId = getPublicId(url);
        const cloudUrl = await uploadToCloud(localFile, publicId);
        newImages.push(cloudUrl);
        changed = true;
      } catch (err) {
        console.warn(`  ⚠️  [${p.id}] ảnh ${j} upload thất bại: ${err.message}`);
        newImages.push(url); // Giữ nguyên nếu lỗi
        failed++;
      }
    }

    if (changed) {
      await p.update({ images: newImages });
      updated++;
    } else {
      skipped++;
    }

    if ((i + 1) % 10 === 0 || i === products.length - 1) {
      console.log(`  → ${i + 1}/${products.length} | uploaded: ${updated} | skipped: ${skipped} | failed: ${failed}`);
    }
  }

  console.log(`\n🎉 Xong! ${updated} sản phẩm đã dùng ảnh Cloudinary.`);
  console.log(`💡 Giờ mày có thể xóa thư mục public/images/products để giải phóng dung lượng.`);
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Lỗi:', err);
  process.exit(1);
});