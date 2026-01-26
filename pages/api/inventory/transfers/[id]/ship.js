import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]';
import { Pool } from 'pg';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const {
    shipment_date,
    tracking_number,
    courier,
    estimated_arrival,
    items
  } = req.body;

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Check current status
    const checkResult = await pool.query(
      'SELECT * FROM inventory_transfers WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      await pool.end();
      return res.status(404).json({ error: 'Transfer not found' });
    }

    const transfer = checkResult.rows[0];

    if (transfer.status !== 'approved' && transfer.status !== 'in_preparation') {
      await pool.end();
      return res.status(400).json({
        error: 'Cannot ship transfer',
        message: `Transfer must be approved first. Current status: ${transfer.status}`
      });
    }

    // Update transfer
    const updateResult = await pool.query(
      `UPDATE inventory_transfers 
       SET status = 'in_transit',
           shipment_date = $1,
           tracking_number = $2,
           courier = $3,
           estimated_arrival = $4,
           shipped_by = $5,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [
        shipment_date || new Date(),
        tracking_number,
        courier,
        estimated_arrival,
        session.user.email || session.user.name,
        id
      ]
    );

    // Update items with shipped quantities
    if (items && items.length > 0) {
      for (const item of items) {
        await pool.query(
          `UPDATE inventory_transfer_items 
           SET quantity_shipped = $1
           WHERE transfer_id = $2 AND product_id = $3`,
          [item.quantity_shipped, id, item.product_id]
        );
      }
    } else {
      // If no items specified, set shipped = approved
      await pool.query(
        `UPDATE inventory_transfer_items 
         SET quantity_shipped = quantity_approved
         WHERE transfer_id = $1`,
        [id]
      );
    }

    // Add history
    await pool.query(
      `INSERT INTO inventory_transfer_history (
        transfer_id, status_from, status_to, changed_by, notes
      ) VALUES ($1, $2, $3, $4, $5)`,
      [
        id,
        transfer.status,
        'in_transit',
        session.user.email || session.user.name,
        `Shipped via ${courier || 'courier'}${tracking_number ? ` - Tracking: ${tracking_number}` : ''}`
      ]
    );

    // TODO: Deduct stock from source location
    // This would integrate with inventory management system
    // Create stock movement records (type: transfer_out)

    await pool.end();

    return res.status(200).json({
      success: true,
      message: 'Transfer marked as shipped',
      data: updateResult.rows[0]
    });

  } catch (error) {
    console.error('Ship transfer error:', error);
    await pool.end();
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
