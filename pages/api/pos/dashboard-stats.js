/**
 * GET /api/pos/dashboard-stats
 * Returns POS dashboard statistics including chart data
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  const { period = '7d' } = req.query;

  // Generate mock data based on period
  const generateSalesTrend = (periodType) => {
    const today = new Date();
    const data = [];
    
    let days = 7;
    if (periodType === '30d') days = 30;
    else if (periodType === '3m') days = 90;
    else if (periodType === '6m') days = 180;
    else if (periodType === '1y') days = 365;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Generate random but realistic sales data
      const baseSales = 10000000;
      const variance = Math.random() * 4000000;
      const sales = baseSales + variance;
      const transactions = Math.floor(100 + Math.random() * 80);
      
      data.push({
        date: dateStr,
        transactions,
        sales: Math.floor(sales)
      });
    }
    
    return data;
  };

  try {
    const salesTrend = generateSalesTrend(period);
    
    return res.status(200).json({
      success: true,
      data: {
        today: {
          transactions: 156,
          sales: 12500000,
          items: 342,
          avgTransaction: 80128.21
        },
        changes: {
          transactions: 12,
          sales: 8
        },
        salesTrend,
        paymentMethods: [
          { method: 'Cash', count: 85, total: 6800000 },
          { method: 'Debit Card', count: 45, total: 3600000 },
          { method: 'Credit Card', count: 20, total: 1600000 },
          { method: 'E-Wallet', count: 6, total: 500000 }
        ],
        topProducts: [
          { name: 'Paracetamol 500mg', quantity: 45, sales: 2250000 },
          { name: 'Amoxicillin 500mg', quantity: 38, sales: 1900000 },
          { name: 'Vitamin C 1000mg', quantity: 52, sales: 1560000 },
          { name: 'Antasida Tablet', quantity: 30, sales: 900000 },
          { name: 'Minyak Kayu Putih 60ml', quantity: 28, sales: 840000 }
        ]
      }
    });
  } catch (error) {
    console.error('POS Dashboard Stats API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }

}
