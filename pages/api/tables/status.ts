import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { sequelize } from '@/lib/sequelizeClient';
import { QueryTypes } from 'sequelize';

/**
 * Tables Status API
 * Returns current status of all tables
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

    // Get all tables with current status
    const tables = await sequelize.query(`
      SELECT 
        t.id,
        t.table_number as number,
        t.status,
        t.capacity,
        t.current_guest_count as guests,
        t.location,
        r.id as reservation_id,
        r.customer_name,
        r.reservation_time
      FROM tables t
      LEFT JOIN reservations r ON t.current_reservation_id = r.id
      WHERE t.tenant_id = :tenantId
      ORDER BY t.table_number ASC
    `, {
      replacements: { tenantId },
      type: QueryTypes.SELECT
    });

    return res.status(200).json({
      success: true,
      data: tables
    });

  } catch (error: any) {
    console.error('Error fetching table status:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}
