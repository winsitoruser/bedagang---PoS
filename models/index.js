const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Import sequelize instance
const sequelize = require('../lib/sequelize');

const db = {};

// Import all models
db.User = require('./User')(sequelize, DataTypes);
db.Customer = require('./Customer')(sequelize, DataTypes);
db.Employee = require('./Employee')(sequelize, DataTypes);
db.Category = require('./Category')(sequelize, DataTypes);
db.Product = require('./Product')(sequelize, DataTypes);
db.Supplier = require('./Supplier')(sequelize, DataTypes);

// Models that are already defined with sequelize instance
db.Stock = require('./Stock');
db.StockMovement = require('./StockMovement');
db.StockAdjustment = require('./StockAdjustment');
db.StockAdjustmentItem = require('./StockAdjustmentItem');
db.PurchaseOrder = require('./PurchaseOrder');
db.PurchaseOrderItem = require('./PurchaseOrderItem');
db.SalesOrder = require('./SalesOrder');
db.SalesOrderItem = require('./SalesOrderItem');
db.GoodsReceipt = require('./GoodsReceipt');
db.GoodsReceiptItem = require('./GoodsReceiptItem');
db.PosTransaction = require('./PosTransaction');
db.PosTransactionItem = require('./PosTransactionItem');
db.Shift = require('./Shift');
db.ShiftHandover = require('./ShiftHandover');
db.CustomerLoyalty = require('./CustomerLoyalty');
db.LoyaltyProgram = require('./LoyaltyProgram');
db.LoyaltyTier = require('./LoyaltyTier');
db.LoyaltyReward = require('./LoyaltyReward');
db.PointTransaction = require('./PointTransaction');
db.RewardRedemption = require('./RewardRedemption');

// Load associations if they exist
// Associations are defined in the models themselves or in separate files
// For now, we skip loading associations to avoid errors

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
