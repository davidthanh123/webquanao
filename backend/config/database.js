const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE || 'railway',
  process.env.MYSQL_USER || 'root',
  process.env.MYSQL_PASSWORD || 'YtHgUOpEgPnMLRYAjUUUQAzCPOAWLfBY',
  {
    // Nếu có biến môi trường MYSQL_HOST (do bạn đặt trong .env hoặc Railway tự có) thì dùng, 
    // nếu không thì mặc định dùng cái host Public để bạn Seed tại máy.
    host: process.env.MYSQL_HOST || 'interchange.proxy.rlwy.net',
    
    // Tương tự cho Port
    port: process.env.MYSQL_PORT || 27854,
    
    dialect: 'mysql',
    logging: false,
  }
);

module.exports = sequelize;