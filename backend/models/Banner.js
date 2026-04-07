const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Banner = sequelize.define('Banner', {
  id:       { type: DataTypes.STRING(36), primaryKey: true },
  image:    { type: DataTypes.STRING },
  title:    { type: DataTypes.STRING },
  subtitle: { type: DataTypes.STRING },
  link:     { type: DataTypes.STRING },
}, { tableName: 'banners', timestamps: false });

module.exports = Banner;