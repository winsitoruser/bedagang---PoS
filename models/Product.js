'use strict';
const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    sku: {
      type: DataTypes.STRING,
      unique: true
    },
    description: {
      type: DataTypes.TEXT
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false
    },
    categoryColor: {
      type: DataTypes.STRING
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    unit: {
      type: DataTypes.STRING
    },
    location: {
      type: DataTypes.STRING
    },
    expiry: {
      type: DataTypes.DATE
    },
    supplier: {
      type: DataTypes.STRING
    },
    supplierId: {
      type: DataTypes.UUID
    },
    reorderPoint: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    image: {
      type: DataTypes.STRING
    },
    isToling: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    composition: {
      type: DataTypes.TEXT
    },
    tenantId: {
      type: DataTypes.UUID
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'products',
    timestamps: true,
    paranoid: false, // Disable paranoid to avoid deletedAt issues
    indexes: [
      {
        fields: ['category']
      },
      {
        fields: ['name']
      },
      {
        fields: ['sku'],
        unique: true,
        where: {
          sku: { [Op.ne]: null }
        }
      },
      {
        fields: ['supplierId']
      },
      {
        fields: ['tenantId']
      },
      {
        fields: ['isToling']
      }
    ]
  });

  Product.associate = function(models) {
    // Relasi dengan TransactionItem
    Product.hasMany(models.TransactionItem, {
      foreignKey: 'productId',
      as: 'transactionItems'
    });
    
    // Relasi dengan Supplier
    Product.belongsTo(models.Supplier, {
      foreignKey: 'supplier_id',
      as: 'supplier'
    });
    
    // Relasi dengan ProductPrice
    if (models.ProductPrice) {
      Product.hasMany(models.ProductPrice, {
        foreignKey: 'product_id',
        as: 'prices'
      });
    }
    
    // Relasi dengan ProductVariant
    if (models.ProductVariant) {
      Product.hasMany(models.ProductVariant, {
        foreignKey: 'product_id',
        as: 'variants'
      });
    }
    
    // Relasi dengan Recipe
    if (models.Recipe) {
      Product.belongsTo(models.Recipe, {
        foreignKey: 'recipe_id',
        as: 'recipe'
      });
    }
  };

  return Product;
};
