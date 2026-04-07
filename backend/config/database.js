const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  // Railway sẽ tự cung cấp các biến này, không cần file .env trên server
  process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE || 'railway',
  process.env.MYSQL_USER || process.env.MYSQLUSER || 'root',
  process.env.MYSQL_PASSWORD || process.env.MYSQLPASSWORD,
  {
    host: process.env.MYSQL_HOST || process.env.MYSQLHOST || 'localhost',
    port: process.env.MYSQL_PORT || process.env.MYSQLPORT || 3306,
    dialect: 'mysql',
    logging: false,
  }
);

// DÒNG NÀY LÀ BẮT BUỘC:
module.exports = sequelize;