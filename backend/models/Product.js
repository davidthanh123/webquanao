const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id:            { type: DataTypes.STRING(36), primaryKey: true },
  name:          { type: DataTypes.STRING, allowNull: false },
  slug:          { type: DataTypes.STRING, unique: true },
  categoryId:    { type: DataTypes.STRING(36) },
  price:         { type: DataTypes.INTEGER },
  originalPrice: { type: DataTypes.INTEGER },
  stock:         { type: DataTypes.INTEGER, defaultValue: 0 },
  sold:          { type: DataTypes.INTEGER, defaultValue: 0 },
  rating:        { type: DataTypes.FLOAT, defaultValue: 0 },
  reviewCount:   { type: DataTypes.INTEGER, defaultValue: 0 },
  description:   { type: DataTypes.TEXT },
  images: {
    type: DataTypes.TEXT,
    get() { return JSON.parse(this.getDataValue('images') || '[]'); },
    set(val) { this.setDataValue('images', JSON.stringify(val)); }
  },
  sizes: {
    type: DataTypes.TEXT,
    get() { return JSON.parse(this.getDataValue('sizes') || '[]'); },
    set(val) { this.setDataValue('sizes', JSON.stringify(val)); }
  },
  colors: {
    type: DataTypes.TEXT,
    get() { return JSON.parse(this.getDataValue('colors') || '[]'); },
    set(val) { this.setDataValue('colors', JSON.stringify(val)); }
  },
  tags: {
    type: DataTypes.TEXT,
    get() { return JSON.parse(this.getDataValue('tags') || '[]'); },
    set(val) { this.setDataValue('tags', JSON.stringify(val)); }
  },
}, { tableName: 'products', timestamps: true });

module.exports = Product;