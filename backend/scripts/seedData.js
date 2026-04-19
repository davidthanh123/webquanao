require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');

async function seed() {
    try {
        await sequelize.sync({ force: true });
        console.log('✅ 1. Database sạch bóng.');

        const salt = await bcrypt.genSalt(10);
        await User.create({ 
            id: 'u1', name: 'Admin', email: 'admin@fashionstore.com', 
            password: await bcrypt.hash('admin123', salt), role: 'admin' 
        });
        
        await Category.bulkCreate([
            { id: 'c1', name: 'Áo Nam', slug: 'ao-nam' },
            { id: 'c3', name: 'Quần Nam', slug: 'quan-nam' },
            { id: 'c15', name: 'Phụ Kiện', slug: 'phu-kien' }
        ]);
        console.log('✅ 2. Admin & Category OK.');

        const csvFilePath = path.join(__dirname, 'shopee-products.csv');
        if (!fs.existsSync(csvFilePath)) {
            console.log('❌ Không thấy file CSV đâu cả!');
            return;
        }

        // ĐỌC FILE THEO KIỂU THÔ (RAW READING)
        const content = fs.readFileSync(csvFilePath, 'utf8');
        const lines = content.split(/\r?\n/); // Chia theo dòng
        const products = [];
        const usedImages = new Set();

        console.log(`⏳ Đang quét ${lines.length} dòng dữ liệu...`);

        // Bỏ qua dòng tiêu đề (i=0), chạy từ dòng 1
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            if (!line.trim()) continue;

            // Tự động đoán dấu phân cách: thử phẩy (,) rồi tới chấm phẩy (;)
            let columns = line.split(',');
            if (columns.length < 5) columns = line.split(';');

            // Theo file của bạn: Cột 2 là Title, Cột 11 là Image (vị trí index 2 và 11)
            const title = columns[2] ? columns[2].replace(/"/g, '').trim() : '';
            let imageUrl = columns[11] ? columns[11].replace(/[\[\]" ]/g, '').split(',')[0] : '';

            if (title && imageUrl && imageUrl.startsWith('http') && !usedImages.has(imageUrl)) {
                usedImages.add(imageUrl);
                
                let catId = 'c15';
                if (title.toLowerCase().includes('áo')) catId = 'c1';
                if (title.toLowerCase().includes('quần')) catId = 'c3';

                products.push({
                    id: 'p' + Math.random().toString(36).substr(2, 9),
                    name: title.substring(0, 150),
                    slug: 'sp-' + Date.now() + i,
                    categoryId: catId,
                    price: 150000,
                    stock: 100,
                    images: JSON.stringify([imageUrl]),
                    sizes: JSON.stringify(["M", "L", "XL"]),
                    colors: JSON.stringify(["Đen", "Trắng"]),
                });
            }
        }

        if (products.length > 0) {
            await Product.bulkCreate(products.slice(0, 100));
            console.log(`🚀 THÀNH CÔNG RỒI! Đã nạp ${products.length} sản phẩm.`);
        } else {
            console.log('❌ Vẫn bằng 0. Có vẻ file CSV bị lỗi Encoding hoặc trống dữ liệu.');
        }
        process.exit(0);

    } catch (error) {
        console.error('❌ Lỗi:', error);
        process.exit(1);
    }
}
seed();