// backend/scripts/cacheImages.js
// Chạy: node scripts/cacheImages.js
// Tác dụng: Download toàn bộ ảnh Shopee về /public/images/products/ và cập nhật DB
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const sequelize = require('../config/database');
const Product = require('../models/Product');

// Thư mục lưu ảnh
const IMG_DIR = path.join(__dirname, '../public/images/products');
if (!fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR, { recursive: true });

// Download 1 URL về file local, trả về tên file đã lưu
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const dest = path.join(IMG_DIR, filename);

    const req = protocol.get(url, {
      headers: {
        'Referer': 'https://shopee.vn',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000,
    }, (res) => {
      // Shopee redirect → theo redirect
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadImage(res.headers.location, filename).then(resolve).catch(reject);
      }

      // Chỉ lưu nếu thực sự là ảnh
      const contentType = res.headers['content-type'] || '';
      if (res.statusCode !== 200 || !contentType.startsWith('image/')) {
        res.resume();
        return reject(new Error(`Bad response: ${res.statusCode} ${contentType}`));
      }

      // Tự động chọn extension từ content-type
      const ext = contentType.includes('png') ? '.png'
                : contentType.includes('webp') ? '.webp'
                : '.jpg';
      const finalName = filename.replace(/\.\w+$/, ext);
      const finalDest = path.join(IMG_DIR, finalName);

      const file = fs.createWriteStream(finalDest);
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(finalName); });
      file.on('error', reject);
    });

    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

// Kiểm tra URL có phải Shopee/cần proxy không
function isExternalUrl(url) {
  return url && (url.includes('susercontent.com') || url.includes('shopee') ||
    (url.startsWith('http') && !url.includes('onrender.com') && !url.includes('localhost')));
}

async function main() {
  await sequelize.authenticate();
  console.log('✅ Kết nối DB thành công\n');

  const products = await Product.findAll();
  console.log(`📦 Tổng ${products.length} sản phẩm cần xử lý\n`);

  let updated = 0, skipped = 0, failed = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const images = Array.isArray(p.images) ? p.images : [];
    let changed = false;
    const newImages = [];

    for (let j = 0; j < images.length; j++) {
      const url = images[j];

      // Bỏ qua URL đã là local hoặc đã được cache
      if (!isExternalUrl(url)) {
        newImages.push(url);
        continue;
      }

      const filename = `${p.id}_${j}_${randomUUID().slice(0, 8)}.jpg`;
      try {
        const savedName = await downloadImage(url, filename);
        newImages.push(`/images/products/${savedName}`);
        changed = true;
      } catch (err) {
        console.warn(`  ⚠️  [${p.id}] ảnh ${j} thất bại: ${err.message}`);
        // Giữ URL gốc nếu download thất bại — không mất ảnh
        newImages.push(url);
        failed++;
      }
    }

    if (changed) {
      await p.update({ images: newImages });
      updated++;
    } else {
      skipped++;
    }

    // Log tiến độ mỗi 20 sản phẩm
    if ((i + 1) % 20 === 0 || i === products.length - 1) {
      console.log(`  → ${i + 1}/${products.length} | cập nhật: ${updated} | bỏ qua: ${skipped} | lỗi ảnh: ${failed}`);
    }
  }

  console.log(`\n🎉 Xong! Đã cập nhật ${updated} sản phẩm, ${failed} ảnh lỗi (giữ URL gốc).`);
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Lỗi:', err);
  process.exit(1);
});