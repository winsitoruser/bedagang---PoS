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
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const tenantId = session.user.tenantId || 'default';

    // Helper function for safe query
    const safeQuery = async (query: string, replacements: any, defaultValue: any) => {
      try {
        const [result]: any = await sequelize.query(query, {
          replacements,
          type: QueryTypes.SELECT
        });
        return result || defaultValue;
      } catch (error) {
        console.error('Query error:', error);
        return defaultValue;
      }
    };

    // 1. Get active kitchen orders count
    const activeOrdersResult = await safeQuery(`
      SELECT COUNT(*) as count FROM kitchen_orders
      WHERE status IN ('pending', 'preparing') AND DATE(created_at) = CURRENT_DATE
    `, {}, { count: 0 });

    // 2. Get tables count
    const tablesResult = await safeQuery(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) as occupied,
        SUM(CASE WHEN status = 'reserved' THEN 1 ELSE 0 END) as reserved,
        SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available
      FROM tables
    `, {}, { total: 0, occupied: 0, reserved: 0, available: 0 });

    // 3. Get today's reservations count
    const reservationsResult = await safeQuery(`
      SELECT COUNT(*) as count FROM reservations WHERE reservation_date = CURRENT_DATE
    `, {}, { count: 0 });

    // 4. Get average prep time
    const avgPrepTimeResult = await safeQuery(`
      SELECT AVG(actual_prep_time) as avg_time FROM kitchen_orders
      WHERE status = 'completed' AND actual_prep_time IS NOT NULL AND DATE(created_at) = CURRENT_DATE
    `, {}, { avg_time: 0 });

    // 5. Get today's sales from POS transactions
    const salesResult = await safeQuery(`
      SELECT COALESCE(SUM(total_amount), 0) as total_sales, COUNT(*) as transaction_count
      FROM pos_transactions WHERE status = 'completed' AND DATE(transaction_date) = CURRENT_DATE
    `, {}, { total_sales: 0, transaction_count: 0 });

    // 6. Get completed orders today
    const completedOrdersResult = await safeQuery(`
      SELECT COUNT(*) as count FROM kitchen_orders
      WHERE status IN ('completed', 'served') AND DATE(created_at) = CURRENT_DATE
    `, {}, { count: 0 });

    // 7. Get total guests today
    const guestsResult = await safeQuery(`
      SELECT COALESCE(SUM(guest_count), 0) as reservation_guests FROM reservations
      WHERE DATE(reservation_date) = CURRENT_DATE AND status IN ('confirmed', 'seated', 'completed')
    `, {}, { reservation_guests: 0, current_guests: 0 });

    // 8. Get low stock items count
    const lowStockResult = await safeQuery(`
      SELECT COUNT(*) as count FROM kitchen_inventory_items WHERE quantity <= minimum_stock
    `, {}, { count: 0 });

    // 9. Get yesterday's sales
    const yesterdaySalesResult = await safeQuery(`
      SELECT COALESCE(SUM(total_amount), 0) as total_sales FROM pos_transactions
      WHERE status = 'completed' AND DATE(transaction_date) = CURRENT_DATE - INTERVAL '1 day'
    `, {}, { total_sales: 0 });

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
    
    // Always return JSON, never HTML
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error?.message || 'Unknown error'
    });
  }
}
