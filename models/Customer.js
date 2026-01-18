'use strict';

module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define('Customer', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(50)
    },
    email: {
      type: DataTypes.STRING(255)
    },
    address: {
      type: DataTypes.TEXT
    },
    loyaltyPoints: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    partnerId: {
      type: DataTypes.UUID
    }
  }, {
    tableName: 'customers',
    timestamps: true
  });

  return Customer;
};
