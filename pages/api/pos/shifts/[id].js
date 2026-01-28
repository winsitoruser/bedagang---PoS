/**
 * API Endpoint: /api/pos/shifts/[id]
 * Methods: GET, PUT, DELETE
 * Description: Manage specific shift - get, update, delete
 */

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ success: false, message: 'Shift ID required' });
  }

  switch (method) {
    case 'GET':
      return getShift(req, res, id);
    case 'PUT':
      return updateShift(req, res, id);
    case 'DELETE':
      return deleteShift(req, res, id);
    default:
      return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}

/**
 * GET /api/pos/shifts/[id]
 * Get shift details
 */
async function getShift(req, res, id) {
  try {
    // Mock data - Replace with database query
    const shift = {
      id,
      shift_number: 'SHF-001',
      cashier_id: 1,
      cashier_name: 'John Doe',
      shift_type: 'pagi',
      start_time: '2026-01-29T08:00:00Z',
      end_time: '2026-01-29T16:00:00Z',
      opening_balance: 1000000,
      closing_balance: 7850000,
      expected_balance: 7800000,
      difference: 50000,
      difference_status: 'over',
      total_transactions: 156,
      cash_sales: 6800000,
      card_sales: 3600000,
      ewallet_sales: 500000,
      total_sales: 10900000,
      status: 'closed'
    };

    return res.status(200).json({
      success: true,
      data: shift
    });

  } catch (error) {
    console.error('Get Shift Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

/**
 * PUT /api/pos/shifts/[id]
 * Update shift (Close Shift or Handover)
 */
async function updateShift(req, res, id) {
  try {
    const { action } = req.body;

    if (action === 'close') {
      return closeShift(req, res, id);
    } else if (action === 'handover') {
      return handoverShift(req, res, id);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Use "close" or "handover"'
      });
    }

  } catch (error) {
    console.error('Update Shift Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

/**
 * Close Shift
 */
async function closeShift(req, res, id) {
  try {
    const {
      closing_balance,
      cash_breakdown,
      closing_notes
    } = req.body;

    // Validation
    if (closing_balance === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Closing balance required'
      });
    }

    // Get current shift data (mock)
    const currentShift = {
      opening_balance: 1000000,
      cash_sales: 6800000,
      card_sales: 3600000,
      ewallet_sales: 500000
    };

    // Calculate expected balance
    const expected_balance = currentShift.opening_balance + currentShift.cash_sales;
    const difference = closing_balance - expected_balance;
    
    let difference_status = 'balanced';
    if (difference > 0) difference_status = 'over';
    else if (difference < 0) difference_status = 'short';

    // Update shift
    const updatedShift = {
      id,
      end_time: new Date().toISOString(),
      closing_balance: parseFloat(closing_balance),
      expected_balance,
      difference,
      difference_status,
      status: 'closed',
      closing_notes: closing_notes || '',
      updated_at: new Date().toISOString()
    };

    // Save cash breakdown if provided
    if (cash_breakdown) {
      // In production: Save to pos_shift_cash_breakdown table
      console.log('Cash breakdown:', cash_breakdown);
    }

    // In production: Update database
    // await db.Shift.update(updatedShift, { where: { id } });

    return res.status(200).json({
      success: true,
      message: 'Shift berhasil ditutup',
      data: updatedShift
    });

  } catch (error) {
    console.error('Close Shift Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

/**
 * Handover Shift
 */
async function handoverShift(req, res, id) {
  try {
    const {
      handover_to_cashier_id,
      handover_to_cashier_name,
      handover_amount,
      handover_notes,
      handover_pin
    } = req.body;

    // Validation
    if (!handover_to_cashier_id || !handover_to_cashier_name || !handover_amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields for handover'
      });
    }

    // Verify PIN (mock - in production, verify against database)
    if (handover_pin !== '1234') {
      return res.status(401).json({
        success: false,
        message: 'PIN kasir penerima salah'
      });
    }

    // Get current shift
    const currentShift = {
      closing_balance: 7850000
    };

    // Validate handover amount
    if (handover_amount > currentShift.closing_balance) {
      return res.status(400).json({
        success: false,
        message: 'Jumlah serah terima melebihi cash tersedia'
      });
    }

    // Update shift
    const updatedShift = {
      id,
      handover_to_cashier_id,
      handover_to_cashier_name,
      handover_amount: parseFloat(handover_amount),
      handover_time: new Date().toISOString(),
      handover_notes: handover_notes || '',
      handover_verified: true,
      status: 'handed_over',
      updated_at: new Date().toISOString()
    };

    // In production: Update database
    // await db.Shift.update(updatedShift, { where: { id } });

    // Create new shift for receiver with opening balance = handover amount
    const newShift = {
      cashier_id: handover_to_cashier_id,
      cashier_name: handover_to_cashier_name,
      opening_balance: parseFloat(handover_amount),
      opening_notes: `Serah terima dari shift ${id}`,
      status: 'pending' // Will be activated when cashier starts
    };

    // In production: Create new shift
    // await db.Shift.create(newShift);

    return res.status(200).json({
      success: true,
      message: 'Serah terima berhasil',
      data: {
        current_shift: updatedShift,
        new_shift: newShift
      }
    });

  } catch (error) {
    console.error('Handover Shift Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

/**
 * DELETE /api/pos/shifts/[id]
 * Delete shift (Admin only)
 */
async function deleteShift(req, res, id) {
  try {
    // Check admin permission (mock)
    const isAdmin = true;

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. Admin only.'
      });
    }

    // In production: Delete from database
    // await db.Shift.destroy({ where: { id } });

    return res.status(200).json({
      success: true,
      message: 'Shift berhasil dihapus'
    });

  } catch (error) {
    console.error('Delete Shift Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}
