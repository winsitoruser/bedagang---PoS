const db = require('../../../models');
const { Product, Supplier } = db;

/**
 * GET /api/inventory/stats
 * Returns dashboard statistics for inventory
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    // Get total products count
    const totalProducts = await Product.count({
      where: { is_active: true },
      paranoid: false
    });

    // Get total inventory value
    const products = await Product.findAll({
      where: { is_active: true },
      attributes: ['price', 'stock', 'cost', 'purchase_price'],
      paranoid: false
    });

    const totalValue = products.reduce((sum, product) => {
      const costValue = parseFloat(product.cost) || parseFloat(product.purchase_price) || parseFloat(product.price);
      const value = costValue * parseFloat(product.stock || 0);
      return sum + value;
    }, 0);

    // Get low stock count
    const lowStockProducts = await Product.count({
      where: {
        is_active: true,
        [db.Sequelize.Op.and]: [
          db.Sequelize.where(
            db.Sequelize.col('stock'),
            '<=',
            db.Sequelize.col('min_stock')
          ),
          {
            stock: {
              [db.Sequelize.Op.gt]: 0
            }
          }
        ]
      },
      paranoid: false
    });

    // Get out of stock count
    const outOfStockProducts = await Product.count({
      where: {
        is_active: true,
        stock: 0
      },
      paranoid: false
    });

    // Get categories count
    const categories = await Product.findAll({
      where: { is_active: true },
      attributes: [[db.Sequelize.fn('DISTINCT', db.Sequelize.col('category')), 'category']],
      raw: true,
      paranoid: false
    });

    // Get suppliers count
    const suppliersCount = await Supplier.count({
      where: { is_active: true },
      paranoid: false
    });

    // Calculate recent changes (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentProducts = await Product.count({
      where: {
        is_active: true,
        created_at: {
          [db.Sequelize.Op.gte]: thirtyDaysAgo
        }
      },
      paranoid: false
    });

    // Get previous month value for comparison
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const previousMonthProducts = await Product.findAll({
      where: {
        is_active: true,
        created_at: {
          [db.Sequelize.Op.between]: [sixtyDaysAgo, thirtyDaysAgo]
        }
      },
      attributes: ['price', 'stock', 'cost', 'purchase_price'],
      paranoid: false
    });

    const previousValue = previousMonthProducts.reduce((sum, product) => {
      const costValue = parseFloat(product.cost) || parseFloat(product.purchase_price) || parseFloat(product.price);
      const value = costValue * parseFloat(product.stock || 0);
      return sum + value;
    }, 0);

    const valueChangePercentage = previousValue > 0 
      ? ((totalValue - previousValue) / previousValue * 100).toFixed(1)
      : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalProducts,
        totalValue: Math.round(totalValue),
        lowStock: lowStockProducts,
        outOfStock: outOfStockProducts,
        categories: categories.length,
        suppliers: suppliersCount,
        recentChanges: {
          products: recentProducts,
          valuePercentage: parseFloat(valueChangePercentage)
        }
      }
    });

  } catch (error) {
    console.error('Inventory Stats API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
