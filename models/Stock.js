const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Stock = sequelize.define('Stock', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Products',
      key: 'id'
    }
  },
  branchId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Branches',
      key: 'id'
    }
  },
  warehouseLocation: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Warehouse bin/location code'
  },
  quantity: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0
  },
  reservedQuantity: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Quantity reserved for pending orders'
  },
  availableQuantity: {
    type: DataTypes.VIRTUAL,
    get() {
      return parseFloat(this.quantity) - parseFloat(this.reservedQuantity);
    }
  },
  minimumStock: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Minimum stock level for alerts'
  },
  maximumStock: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    comment: 'Maximum stock level'
  },
  reorderPoint: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    comment: 'Reorder point for automatic purchase orders'
  },
  reorderQuantity: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    comment: 'Default quantity to reorder'
  },
  lastStockCount: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Last physical stock count date'
  },
  lastRestockDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  averageCost: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    comment: 'Weighted average cost'
  },
  totalValue: {
    type: DataTypes.VIRTUAL,
    get() {
      return parseFloat(this.quantity) * parseFloat(this.averageCost || 0);
    }
  }
}, {
  tableName: 'stocks',
  timestamps: true,
  indexes: [
    {
      fields: ['productId', 'branchId'],
      unique: true
    },
    {
      fields: ['quantity']
    },
    {
      fields: ['minimumStock']
    }
  ]
});

module.exports = Stock;
