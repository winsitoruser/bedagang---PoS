'use strict';

module.exports = (sequelize, DataTypes) => {
  const Supplier = sequelize.define('Supplier', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    supplier_code: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    company_name: {
      type: DataTypes.STRING(255)
    },
    contact_person: {
      type: DataTypes.STRING(255)
    },
    email: {
      type: DataTypes.STRING(255)
    },
    phone: {
      type: DataTypes.STRING(50)
    },
    mobile: {
      type: DataTypes.STRING(50)
    },
    address: {
      type: DataTypes.TEXT
    },
    city: {
      type: DataTypes.STRING(100)
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended'),
      defaultValue: 'active'
    },
    tenant_id: {
      type: DataTypes.UUID
    }
  }, {
    tableName: 'suppliers',
    timestamps: true,
    underscored: true
  });

  return Supplier;
};
