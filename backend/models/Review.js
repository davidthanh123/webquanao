const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Review = sequelize.define('Review', {
  id:        { type: DataTypes.STRING(36), primaryKey: true },
  productId: { type: DataTypes.STRING(36), allowNull: false },
  userId:    { type: DataTypes.STRING(36), allowNull: false },
  rating:    { type: DataTypes.INTEGER },
  comment:   { type: DataTypes.TEXT },
}, { tableName: 'reviews', timestamps: true });

module.exports = Review;