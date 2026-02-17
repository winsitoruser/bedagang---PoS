import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { sequelize } from '@/lib/sequelizeClient';
import { QueryTypes } from 'sequelize';

/**
 * F&B Dashboard Stats API
 * Returns comprehensive statistics for F&B operations
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const tenantId = session.user.tenantId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Get active kitchen orders count
    const [activeOrdersResult]: any = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM kitchen_orders
      WHERE tenant_id = :tenantId
        AND status IN ('new', 'preparing')
        AND DATE(created_at) = DATE(NOW())
    `, {
      replacements: { tenantId },
      type: QueryTypes.SELECT
    });

    // 2. Get tables occupied count
    const [tablesResult]: any = await sequelize.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) as occupied,
        SUM(CASE WHEN status = 'reserved' THEN 1 ELSE 0 END) as reserved,
        SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available
      FROM tables
      WHERE tenant_id = :tenantId
    `, {
      replacements: { tenantId },
      type: QueryTypes.SELECT
    });

    // 3. Get today's reservations count
    const [reservationsResult]: any = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM reservations
      WHERE tenant_id = :tenantId
        AND DATE(reservation_date) = DATE(NOW())
    `, {
      replacements: { tenantId },
      type: QueryTypes.SELECT
    });

    // 4. Get average prep time
    const [avgPrepTimeResult]: any = await sequelize.query(`
      SELECT AVG(actual_prep_time) as avg_time
      FROM kitchen_orders
      WHERE tenant_id = :tenantId
        AND status = 'completed'
        AND actual_prep_time IS NOT NULL
        AND DATE(created_at) = DATE(NOW())
    `, {
      replacements: { tenantId },
      type: QueryTypes.SELECT
    });

    // 5. Get today's sales from POS transactions
    const [salesResult]: any = await sequelize.query(`
      SELECT 
        COALESCE(SUM(total_amount), 0) as total_sales,
        COUNT(*) as transaction_count
      FROM pos_transactions
      WHERE tenant_id = :tenantId
        AND status = 'completed'
        AND DATE(transaction_date) = DATE(NOW())
    `, {
      replacements: { tenantId },
      type: QueryTypes.SELECT
    });

    // 6. Get completed orders today
    const [completedOrdersResult]: any = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM kitchen_orders
      WHERE tenant_id = :tenantId
        AND status IN ('completed', 'served')
        AND DATE(created_at) = DATE(NOW())
    `, {
      replacements: { tenantId },
      type: QueryTypes.SELECT
    });

    // 7. Get total guests today (from reservations + walk-ins)
    const [guestsResult]: any = await sequelize.query(`
      SELECT 
        COALESCE(SUM(r.guest_count), 0) as reservation_guests,
        COALESCE(SUM(t.current_guest_count), 0) as current_guests
      FROM reservations r
      LEFT JOIN tables t ON r.table_id = t.id
      WHERE r.tenant_id = :tenantId
        AND DATE(r.reservation_date) = DATE(NOW())
        AND r.status IN ('confirmed', 'seated', 'completed')
    `, {
      replacements: { tenantId },
      type: QueryTypes.SELECT
    });

    // 8. Get low stock items count
    const [lowStockResult]: any = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM kitchen_inventory_items
      WHERE tenant_id = :tenantId
        AND status IN ('low', 'critical')
    `, {
      replacements: { tenantId },
      type: QueryTypes.SELECT
    });

    // 9. Get yesterday's sales for comparison
    const [yesterdaySalesResult]: any = await sequelize.query(`
      SELECT COALESCE(SUM(total_amount), 0) as total_sales
      FROM pos_transactions
      WHERE tenant_id = :tenantId
        AND status = 'completed'
        AND DATE(transaction_date) = DATE(NOW() - INTERVAL '1 day')
    `, {
      replacements: { tenantId },
      type: QueryTypes.SELECT
    });

    // Calculate percentage changes
    const todaySales = parseFloat(salesResult.total_sales) || 0;
    const yesterdaySales = parseFloat(yesterdaySalesResult.total_sales) || 0;
    const salesChange = yesterdaySales > 0 
      ? ((todaySales - yesterdaySales) / yesterdaySales * 100).toFixed(1)
      : 0;

    const stats = {
      activeOrders: parseInt(activeOrdersResult.count) || 0,
      tablesOccupied: parseInt(tablesResult.occupied) || 0,
      tablesTotal: parseInt(tablesResult.total) || 0,
      tablesReserved: parseInt(tablesResult.reserved) || 0,
      tablesAvailable: parseInt(tablesResult.available) || 0,
      todayReservations: parseInt(reservationsResult.count) || 0,
      avgPrepTime: Math.round(parseFloat(avgPrepTimeResult.avg_time) || 0),
      todaySales: todaySales,
      yesterdaySales: yesterdaySales,
      salesChange: parseFloat(salesChange as string),
      completedOrders: parseInt(completedOrdersResult.count) || 0,
      totalGuests: parseInt(guestsResult.reservation_guests) || 0,
      currentGuests: parseInt(guestsResult.current_guests) || 0,
      lowStockItems: parseInt(lowStockResult.count) || 0,
      transactionCount: parseInt(salesResult.transaction_count) || 0
    };

    return res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error: any) {
    console.error('Error fetching F&B stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}
