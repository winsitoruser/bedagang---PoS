const db = require('../../../models');
const { Product } = db;

/**
 * GET /api/inventory/activities
 * Returns recent inventory activities (stock movements, adjustments, etc)
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const { limit = 20, type, product_id } = req.query;

    // Build where clause
    const where = {};
    
    if (type) {
      where.activity_type = type;
    }
    
    if (product_id) {
      where.product_id = product_id;
    }

    // For now, we'll create mock activities based on recent product updates
    // In production, you should have a dedicated stock_movements or inventory_activities table
    
    // Get recently updated products as proxy for activities
    const recentProducts = await Product.findAll({
      where: { is_active: true },
      order: [['updated_at', 'DESC']],
      limit: parseInt(limit),
      attributes: ['id', 'name', 'sku', 'stock', 'updated_at', 'created_at'],
      paranoid: false
    });

    // Transform to activity format
    const activities = recentProducts.map((product, index) => {
      // Simulate different activity types
      const types = ['in', 'out', 'adjustment', 'transfer'];
      const activityType = types[index % types.length];
      
      let quantity = Math.floor(Math.random() * 50) + 1;
      if (activityType === 'out' || activityType === 'adjustment') {
        quantity = -quantity;
      }

      return {
        id: `activity-${product.id}-${index}`,
        type: activityType,
        product_id: product.id,
        product_name: product.name,
        product_sku: product.sku,
        quantity: quantity,
        current_stock: product.stock,
        user: 'Admin', // In production, get from user session
        timestamp: product.updated_at || product.created_at,
        notes: getActivityNotes(activityType, product.name, quantity)
      };
    });

    return res.status(200).json({
      success: true,
      data: activities,
      total: activities.length
    });

  } catch (error) {
    console.error('Inventory Activities API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

function getActivityNotes(type, productName, quantity) {
  const absQty = Math.abs(quantity);
  switch (type) {
    case 'in':
      return `Penerimaan stock ${productName} sebanyak ${absQty} unit`;
    case 'out':
      return `Penjualan ${productName} sebanyak ${absQty} unit`;
    case 'adjustment':
      return `Penyesuaian stock ${productName} sebanyak ${quantity} unit`;
    case 'transfer':
      return `Transfer ${productName} sebanyak ${absQty} unit`;
    default:
      return `Aktivitas ${productName}`;
  }
}

/**
 * NOTE: For production, create a proper stock_movements table:
 * 
 * CREATE TABLE stock_movements (
 *   id UUID PRIMARY KEY,
 *   product_id INTEGER REFERENCES products(id),
 *   movement_type VARCHAR(50), -- 'in', 'out', 'adjustment', 'transfer', 'return'
 *   quantity DECIMAL(10,2),
 *   previous_stock DECIMAL(10,2),
 *   new_stock DECIMAL(10,2),
 *   reference_type VARCHAR(50), -- 'purchase_order', 'sale', 'adjustment', 'transfer'
 *   reference_id VARCHAR(100),
 *   warehouse_from VARCHAR(100),
 *   warehouse_to VARCHAR(100),
 *   user_id UUID REFERENCES users(id),
 *   notes TEXT,
 *   created_at TIMESTAMP DEFAULT NOW()
 * );
 */
