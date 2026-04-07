// backend/config/database.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE,
  process.env.MYSQL_USER || process.env.MYSQLUSER,
  process.env.MYSQL_PASSWORD || process.env.MYSQLPASSWORD,
  {
    host: process.env.MYSQL_HOST || process.env.MYSQLHOST,
    port: process.env.MYSQL_PORT || process.env.MYSQLPORT || 3306,
    dialect: 'mysql',
    logging: false,
  }
);