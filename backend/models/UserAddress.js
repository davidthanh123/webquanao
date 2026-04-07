const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserAddress = sequelize.define('UserAddress', {
  id:        { type: DataTypes.STRING(36), primaryKey: true },
  userId:    { type: DataTypes.STRING(36), allowNull: false },
  name:      { type: DataTypes.STRING },
  phone:     { type: DataTypes.STRING },
  address:   { type: DataTypes.STRING },
  isDefault: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'user_addresses', timestamps: false });

module.exports = UserAddress;