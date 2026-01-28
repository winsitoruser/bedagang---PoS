/**
 * API Endpoint: /api/pos/shifts
 * Methods: GET, POST
 * Description: Manage POS shifts - list, create
 */

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return getShifts(req, res);
    case 'POST':
      return createShift(req, res);
    default:
      return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}

/**
 * GET /api/pos/shifts
 * Get all shifts with optional filters
 */
async function getShifts(req, res) {
  try {
    const { cashier_id, status, date_from, date_to, limit = 50 } = req.query;

    // Mock data - Replace with actual database query
    const mockShifts = [
      {
        id: '1',
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
        refunds: 0,
        discounts: 100000,
        status: 'closed',
        opening_notes: 'Shift pagi dimulai',
        closing_notes: 'Kelebihan Rp 50.000',
        created_at: '2026-01-29T08:00:00Z',
        updated_at: '2026-01-29T16:00:00Z'
      },
      {
        id: '2',
        shift_number: 'SHF-002',
        cashier_id: 2,
        cashier_name: 'Jane Smith',
        shift_type: 'siang',
        start_time: '2026-01-29T16:00:00Z',
        end_time: null,
        opening_balance: 1000000,
        closing_balance: null,
        expected_balance: null,
        difference: null,
        difference_status: null,
        total_transactions: 45,
        cash_sales: 2500000,
        card_sales: 1200000,
        ewallet_sales: 300000,
        total_sales: 4000000,
        refunds: 0,
        discounts: 50000,
        status: 'active',
        opening_notes: 'Shift siang dimulai',
        closing_notes: null,
        created_at: '2026-01-29T16:00:00Z',
        updated_at: '2026-01-29T16:00:00Z'
      }
    ];

    // Apply filters
    let filteredShifts = mockShifts;
    
    if (cashier_id) {
      filteredShifts = filteredShifts.filter(s => s.cashier_id === parseInt(cashier_id));
    }
    
    if (status) {
      filteredShifts = filteredShifts.filter(s => s.status === status);
    }

    return res.status(200).json({
      success: true,
      data: filteredShifts.slice(0, parseInt(limit)),
      total: filteredShifts.length
    });

  } catch (error) {
    console.error('Get Shifts Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

/**
 * POST /api/pos/shifts
 * Create new shift (Open Shift)
 */
async function createShift(req, res) {
  try {
    const {
      cashier_id,
      cashier_name,
      shift_type,
      opening_balance,
      opening_notes
    } = req.body;

    // Validation
    if (!cashier_id || !cashier_name || !shift_type || !opening_balance) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    if (opening_balance <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Opening balance must be greater than 0'
      });
    }

    // Check if cashier already has active shift
    // In production, query database for active shifts
    const hasActiveShift = false; // Mock check

    if (hasActiveShift) {
      return res.status(400).json({
        success: false,
        message: 'Kasir sudah memiliki shift aktif'
      });
    }

    // Create new shift
    const newShift = {
      id: Date.now().toString(),
      shift_number: `SHF-${String(Date.now()).slice(-6)}`,
      cashier_id,
      cashier_name,
      shift_type,
      start_time: new Date().toISOString(),
      end_time: null,
      opening_balance: parseFloat(opening_balance),
      closing_balance: null,
      expected_balance: null,
      difference: null,
      difference_status: null,
      total_transactions: 0,
      cash_sales: 0,
      card_sales: 0,
      ewallet_sales: 0,
      total_sales: 0,
      refunds: 0,
      discounts: 0,
      status: 'active',
      opening_notes: opening_notes || '',
      closing_notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // In production: Save to database
    // await db.Shift.create(newShift);

    return res.status(201).json({
      success: true,
      message: 'Shift berhasil dibuka',
      data: newShift
    });

  } catch (error) {
    console.error('Create Shift Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}
