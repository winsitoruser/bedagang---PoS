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
  const { approval_notes, estimated_shipment_date } = req.body;

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

    if (transfer.status !== 'requested') {
      await pool.end();
      return res.status(400).json({
        error: 'Cannot approve transfer',
        message: `Transfer is already ${transfer.status}`
      });
    }

    // TODO: Check stock availability at source location
    // This would integrate with inventory management system

    // Update transfer
    const updateResult = await pool.query(
      `UPDATE inventory_transfers 
       SET status = 'approved',
           approved_by = $1,
           approval_date = CURRENT_TIMESTAMP,
           approval_notes = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [session.user.email || session.user.name, approval_notes, id]
    );

    // Update items (set approved quantity = requested quantity)
    await pool.query(
      `UPDATE inventory_transfer_items 
       SET quantity_approved = quantity_requested
       WHERE transfer_id = $1`,
      [id]
    );

    // Add history
    await pool.query(
      `INSERT INTO inventory_transfer_history (
        transfer_id, status_from, status_to, changed_by, notes
      ) VALUES ($1, $2, $3, $4, $5)`,
      [id, 'requested', 'approved', session.user.email || session.user.name, approval_notes || 'Transfer approved']
    );

    await pool.end();

    return res.status(200).json({
      success: true,
      message: 'Transfer approved successfully',
      data: updateResult.rows[0]
    });

  } catch (error) {
    console.error('Approve transfer error:', error);
    await pool.end();
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
