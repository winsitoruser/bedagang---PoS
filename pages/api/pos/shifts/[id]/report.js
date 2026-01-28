/**
 * API Endpoint: /api/pos/shifts/[id]/report
 * Method: GET
 * Description: Generate shift report (PDF/JSON)
 */

export default async function handler(req, res) {
  const { id } = req.query;
  const { format = 'json' } = req.query;

  if (!id) {
    return res.status(400).json({ success: false, message: 'Shift ID required' });
  }

  try {
    // Get shift data (mock - replace with database query)
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
      refunds: 0,
      discounts: 100000,
      handover_to_cashier_name: 'Jane Smith',
      handover_amount: 1000000,
      opening_notes: 'Shift pagi dimulai',
      closing_notes: 'Kelebihan Rp 50.000'
    };

    // Get cash breakdown (mock)
    const cashBreakdown = {
      note_100k: 78,
      note_50k: 1,
      note_20k: 0,
      note_10k: 0,
      note_5k: 0,
      note_2k: 0,
      note_1k: 0,
      coins: 0
    };

    if (format === 'pdf') {
      return generatePDFReport(res, shift, cashBreakdown);
    } else {
      return generateJSONReport(res, shift, cashBreakdown);
    }

  } catch (error) {
    console.error('Generate Report Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

/**
 * Generate JSON Report
 */
function generateJSONReport(res, shift, cashBreakdown) {
  const report = {
    shift_info: {
      shift_number: shift.shift_number,
      cashier: shift.cashier_name,
      shift_type: shift.shift_type,
      date: new Date(shift.start_time).toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      start_time: new Date(shift.start_time).toLocaleTimeString('id-ID'),
      end_time: new Date(shift.end_time).toLocaleTimeString('id-ID'),
      duration: calculateDuration(shift.start_time, shift.end_time)
    },
    sales_summary: {
      total_transactions: shift.total_transactions,
      cash_sales: formatCurrency(shift.cash_sales),
      card_sales: formatCurrency(shift.card_sales),
      ewallet_sales: formatCurrency(shift.ewallet_sales),
      total_sales: formatCurrency(shift.total_sales),
      refunds: formatCurrency(shift.refunds),
      discounts: formatCurrency(shift.discounts)
    },
    cash_management: {
      opening_balance: formatCurrency(shift.opening_balance),
      cash_sales: formatCurrency(shift.cash_sales),
      expected_balance: formatCurrency(shift.expected_balance),
      actual_balance: formatCurrency(shift.closing_balance),
      difference: formatCurrency(shift.difference),
      difference_status: shift.difference_status,
      cash_breakdown: {
        'Rp 100.000': `${cashBreakdown.note_100k} lembar = ${formatCurrency(cashBreakdown.note_100k * 100000)}`,
        'Rp 50.000': `${cashBreakdown.note_50k} lembar = ${formatCurrency(cashBreakdown.note_50k * 50000)}`,
        'Rp 20.000': `${cashBreakdown.note_20k} lembar = ${formatCurrency(cashBreakdown.note_20k * 20000)}`,
        'Rp 10.000': `${cashBreakdown.note_10k} lembar = ${formatCurrency(cashBreakdown.note_10k * 10000)}`,
        'Rp 5.000': `${cashBreakdown.note_5k} lembar = ${formatCurrency(cashBreakdown.note_5k * 5000)}`,
        'Rp 2.000': `${cashBreakdown.note_2k} lembar = ${formatCurrency(cashBreakdown.note_2k * 2000)}`,
        'Rp 1.000': `${cashBreakdown.note_1k} lembar = ${formatCurrency(cashBreakdown.note_1k * 1000)}`,
        'Koin': formatCurrency(cashBreakdown.coins)
      }
    },
    handover: shift.handover_to_cashier_name ? {
      to_cashier: shift.handover_to_cashier_name,
      amount: formatCurrency(shift.handover_amount),
      remaining: formatCurrency(shift.closing_balance - shift.handover_amount)
    } : null,
    notes: {
      opening: shift.opening_notes,
      closing: shift.closing_notes
    },
    generated_at: new Date().toISOString()
  };

  return res.status(200).json({
    success: true,
    data: report
  });
}

/**
 * Generate PDF Report
 * Note: In production, use library like pdfkit or puppeteer
 */
function generatePDFReport(res, shift, cashBreakdown) {
  // For now, return HTML that can be printed as PDF
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Laporan Shift ${shift.shift_number}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #000;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .section {
      margin-bottom: 20px;
    }
    .section-title {
      background: #f0f0f0;
      padding: 8px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    td {
      padding: 5px;
      border-bottom: 1px solid #ddd;
    }
    .label {
      width: 40%;
      font-weight: bold;
    }
    .value {
      width: 60%;
      text-align: right;
    }
    .total-row {
      font-weight: bold;
      font-size: 1.1em;
      background: #f9f9f9;
    }
    .signature {
      margin-top: 40px;
      display: flex;
      justify-content: space-between;
    }
    .signature-box {
      text-align: center;
      width: 45%;
    }
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>LAPORAN SHIFT</h1>
    <h2>${shift.shift_number}</h2>
    <p>${new Date(shift.start_time).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>

  <div class="section">
    <div class="section-title">INFORMASI SHIFT</div>
    <table>
      <tr>
        <td class="label">Kasir:</td>
        <td class="value">${shift.cashier_name}</td>
      </tr>
      <tr>
        <td class="label">Shift:</td>
        <td class="value">${shift.shift_type.toUpperCase()}</td>
      </tr>
      <tr>
        <td class="label">Waktu Mulai:</td>
        <td class="value">${new Date(shift.start_time).toLocaleTimeString('id-ID')}</td>
      </tr>
      <tr>
        <td class="label">Waktu Selesai:</td>
        <td class="value">${new Date(shift.end_time).toLocaleTimeString('id-ID')}</td>
      </tr>
      <tr>
        <td class="label">Durasi:</td>
        <td class="value">${calculateDuration(shift.start_time, shift.end_time)}</td>
      </tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">PENJUALAN</div>
    <table>
      <tr>
        <td class="label">Total Transaksi:</td>
        <td class="value">${shift.total_transactions}</td>
      </tr>
      <tr>
        <td class="label">• Cash:</td>
        <td class="value">${formatCurrency(shift.cash_sales)}</td>
      </tr>
      <tr>
        <td class="label">• Debit/Credit Card:</td>
        <td class="value">${formatCurrency(shift.card_sales)}</td>
      </tr>
      <tr>
        <td class="label">• E-Wallet:</td>
        <td class="value">${formatCurrency(shift.ewallet_sales)}</td>
      </tr>
      <tr class="total-row">
        <td class="label">TOTAL PENJUALAN:</td>
        <td class="value">${formatCurrency(shift.total_sales)}</td>
      </tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">CASH MANAGEMENT</div>
    <table>
      <tr>
        <td class="label">Modal Awal:</td>
        <td class="value">${formatCurrency(shift.opening_balance)}</td>
      </tr>
      <tr>
        <td class="label">Cash Sales:</td>
        <td class="value">${formatCurrency(shift.cash_sales)}</td>
      </tr>
      <tr>
        <td class="label">Expected Cash:</td>
        <td class="value">${formatCurrency(shift.expected_balance)}</td>
      </tr>
      <tr>
        <td class="label">Actual Cash:</td>
        <td class="value">${formatCurrency(shift.closing_balance)}</td>
      </tr>
      <tr class="total-row" style="background: ${shift.difference > 0 ? '#d4edda' : shift.difference < 0 ? '#f8d7da' : '#f9f9f9'}">
        <td class="label">SELISIH:</td>
        <td class="value">${shift.difference > 0 ? '+' : ''}${formatCurrency(shift.difference)} (${shift.difference_status.toUpperCase()})</td>
      </tr>
    </table>

    <h4>Breakdown Denominasi:</h4>
    <table>
      <tr>
        <td class="label">Rp 100.000 × ${cashBreakdown.note_100k}</td>
        <td class="value">${formatCurrency(cashBreakdown.note_100k * 100000)}</td>
      </tr>
      <tr>
        <td class="label">Rp 50.000 × ${cashBreakdown.note_50k}</td>
        <td class="value">${formatCurrency(cashBreakdown.note_50k * 50000)}</td>
      </tr>
      <tr>
        <td class="label">Koin</td>
        <td class="value">${formatCurrency(cashBreakdown.coins)}</td>
      </tr>
    </table>
  </div>

  ${shift.handover_to_cashier_name ? `
  <div class="section">
    <div class="section-title">SERAH TERIMA</div>
    <table>
      <tr>
        <td class="label">Kepada:</td>
        <td class="value">${shift.handover_to_cashier_name}</td>
      </tr>
      <tr>
        <td class="label">Jumlah:</td>
        <td class="value">${formatCurrency(shift.handover_amount)}</td>
      </tr>
      <tr>
        <td class="label">Sisa Disetor:</td>
        <td class="value">${formatCurrency(shift.closing_balance - shift.handover_amount)}</td>
      </tr>
    </table>
  </div>
  ` : ''}

  <div class="signature">
    <div class="signature-box">
      <p>Kasir</p>
      <br><br><br>
      <p>_________________</p>
      <p>${shift.cashier_name}</p>
    </div>
    ${shift.handover_to_cashier_name ? `
    <div class="signature-box">
      <p>Penerima</p>
      <br><br><br>
      <p>_________________</p>
      <p>${shift.handover_to_cashier_name}</p>
    </div>
    ` : ''}
  </div>

  <p class="no-print" style="text-align: center; margin-top: 20px;">
    <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">
      🖨️ Print Laporan
    </button>
  </p>
</body>
</html>
  `;

  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}

// Helper functions
function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
}

function calculateDuration(start, end) {
  const diff = new Date(end) - new Date(start);
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours} jam ${minutes} menit`;
}
