const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
  id:    { type: DataTypes.STRING(36), primaryKey: true },
  name:  { type: DataTypes.STRING, allowNull: false },
  slug:  { type: DataTypes.STRING, unique: true },
  image: { type: DataTypes.STRING },
}, { tableName: 'categories', timestamps: false });

module.exports = Category;