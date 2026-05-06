const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE || 'defaultdb',
  process.env.MYSQL_USER || 'avnadmin',
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST || 'mysql-1577d162-thanhzata123-2174.h.aivencloud.com',
    port: process.env.MYSQL_PORT || 28424,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Aiven SSL
      }
    }
  }
);

module.exports = sequelize;