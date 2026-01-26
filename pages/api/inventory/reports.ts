import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { Pool } from 'pg';
import InventoryReportsQueries from '../../../lib/database/inventory-reports-queries';
import { createLogger } from '../../../lib/logger-factory';

const logger = createLogger('inventory-reports-api');

// Mock data untuk laporan inventori
const generateMockReportsData = () => {
  const currentDate = new Date();
  
  // Stock Value Summary
  const stockValueSummary = {
    totalValue: 2847500000,
    previousTotalValue: 2650000000,
    categories: [
      {
        id: 'cat-1',
        name: 'Obat Keras',
        itemCount: 45,
        value: 1250000000,
        percentage: 43.9,
        trend: 'up',
        trendPercentage: 8.5
      },
      {
        id: 'cat-2', 
        name: 'Obat Bebas',
        itemCount: 32,
        value: 850000000,
        percentage: 29.9,
        trend: 'up',
        trendPercentage: 5.2
      },
      {
        id: 'cat-3',
        name: 'Vitamin & Suplemen',
        itemCount: 28,
        value: 425000000,
        percentage: 14.9,
        trend: 'stable',
        trendPercentage: 0
      },
      {
        id: 'cat-4',
        name: 'Obat Luar',
        itemCount: 18,
        value: 322500000,
        percentage: 11.3,
        trend: 'down',
        trendPercentage: -2.1
      }
    ]
  };

  // Stock Movement Data
  const stockMovements = [
    {
      id: 'mov-1',
      date: new Date(currentDate.getTime() - 86400000), // 1 day ago
      type: 'in',
      reference: 'PO-2025-001',
      productName: 'Paracetamol 500mg',
      productId: 'prod-1',
      sku: 'MED-PCT-500',
      quantity: 100,
      fromTo: 'PT Kimia Farma',
      notes: 'Pesanan reguler bulanan',
      staff: 'Admin Gudang',
      batchNumber: 'BATCH-A001',
      expiryDate: '2026-12-31'
    },
    {
      id: 'mov-2',
      date: new Date(currentDate.getTime() - 172800000), // 2 days ago
      type: 'out',
      reference: 'SO-2025-045',
      productName: 'Amoxicillin 500mg',
      productId: 'prod-2',
      sku: 'MED-AMX-500',
      quantity: 25,
      fromTo: 'Klinik Sehat Sentosa',
      notes: 'Penjualan grosir',
      staff: 'Kasir 1',
      batchNumber: 'BATCH-B002',
      expiryDate: '2026-08-15'
    },
    {
      id: 'mov-3',
      date: new Date(currentDate.getTime() - 259200000), // 3 days ago
      type: 'adjustment',
      reference: 'ADJ-2025-001',
      productName: 'Vitamin C 1000mg',
      productId: 'prod-3',
      sku: 'SUP-VTC-1000',
      quantity: -5,
      fromTo: 'Stock Opname',
      notes: 'Koreksi stok fisik',
      staff: 'Supervisor Gudang',
      batchNumber: 'BATCH-C003',
      expiryDate: '2025-06-30'
    }
  ];

  // Low Stock Products
  const lowStockProducts = [
    {
      id: 'low-1',
      productName: 'Paracetamol 500mg',
      sku: 'MED-PCT-500',
      categoryName: 'Obat Bebas',
      currentStock: 8,
      minStock: 20,
      maxStock: 100,
      reorderPoint: 15,
      price: 12000,
      supplier: 'PT Kimia Farma',
      location: 'Rak A-1',
      lastRestockDate: '2025-01-15',
      status: 'critical'
    },
    {
      id: 'low-2',
      productName: 'Amoxicillin 500mg',
      sku: 'MED-AMX-500',
      categoryName: 'Obat Keras',
      currentStock: 12,
      minStock: 25,
      maxStock: 150,
      reorderPoint: 30,
      price: 25000,
      supplier: 'PT Dexa Medica',
      location: 'Rak B-2',
      lastRestockDate: '2025-01-10',
      status: 'warning'
    }
  ];

  // Product Analysis
  const productAnalysis = {
    topSellingProducts: [
      {
        id: 'top-1',
        productName: 'Paracetamol 500mg',
        sku: 'MED-PCT-500',
        totalSold: 450,
        revenue: 5400000,
        profit: 1350000,
        profitMargin: 25,
        trend: 'up'
      },
      {
        id: 'top-2',
        productName: 'Vitamin C 1000mg',
        sku: 'SUP-VTC-1000',
        totalSold: 320,
        revenue: 4800000,
        profit: 1200000,
        profitMargin: 25,
        trend: 'stable'
      }
    ],
    slowMovingProducts: [
      {
        id: 'slow-1',
        productName: 'Obat Khusus X',
        sku: 'MED-OKX-001',
        currentStock: 45,
        lastSaleDate: '2024-11-15',
        daysSinceLastSale: 76,
        value: 2250000,
        recommendation: 'Consider discount or return to supplier'
      }
    ]
  };

  return {
    stockValueSummary,
    stockMovements,
    lowStockProducts,
    productAnalysis
  };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const operationLogger = logger.child({ method: req.method, url: req.url });
  
  try {
    // Authentication (temporarily disabled for testing)
    // const session = await getServerSession(req, res, authOptions);
    // if (!session) {
    //   return res.status(401).json({ success: false, message: 'Unauthorized' });
    // }

    const { method } = req;
    operationLogger.info('Processing inventory reports request');

    switch (method) {
      case 'GET':
        return handleGetReports(req, res);
      case 'POST':
        return handleCreateReport(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ 
          success: false, 
          message: `Method ${method} not allowed` 
        });
    }
  } catch (error) {
    operationLogger.error('Reports API Error', { error: (error as Error).message });
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
}

async function handleGetReports(req: NextApiRequest, res: NextApiResponse) {
  const operationLogger = logger.child({ operation: 'handleGetReports' });
  
  try {
    const { 
      reportType = 'stock-value',
      period = 'all-time',
      branch = 'all',
      category,
      dateFrom,
      dateTo,
      page = '1',
      limit = '10'
    } = req.query;

    operationLogger.info('Processing report request', { reportType, period, branch });

    // Initialize database connection
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    
    const reportsQueries = new InventoryReportsQueries(pool);
    
    // Set timeout for database operations
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    let responseData;
    let isFromMock = false;

    try {
      switch (reportType) {
        case 'stock-value':
          responseData = await reportsQueries.getStockValueReport({
            branch: branch as string,
            period: period as string,
            dateFrom: dateFrom as string,
            dateTo: dateTo as string
          });
          break;

        case 'stock-movement':
          const pageNum = parseInt(page as string);
          const limitNum = parseInt(limit as string);
          
          responseData = await reportsQueries.getStockMovementReport({
            branch: branch as string,
            period: period as string,
            dateFrom: dateFrom as string,
            dateTo: dateTo as string,
            page: pageNum,
            limit: limitNum
          });
          break;

        case 'low-stock':
          responseData = await reportsQueries.getLowStockReport({
            branch: branch as string
          });
          break;

        case 'product-analysis':
          responseData = await reportsQueries.getProductAnalysisReport({
            branch: branch as string,
            period: period as string
          });
          break;

        default:
          await pool.end();
          return res.status(400).json({
            success: false,
            message: 'Invalid report type'
          });
      }
      
      clearTimeout(timeoutId);
      await pool.end();
      operationLogger.info('Database report generated successfully', { reportType });
      
    } catch (dbError) {
      clearTimeout(timeoutId);
      await pool.end();
      operationLogger.warn('Database operation failed, falling back to mock data', { 
        error: (dbError as Error).message 
      });
      
      // Fallback to mock data
      const mockData = generateMockReportsData();
      isFromMock = true;
      
      switch (reportType) {
        case 'stock-value':
          responseData = {
            summary: mockData.stockValueSummary,
            period: period,
            branch: branch,
            generatedAt: new Date().toISOString()
          };
          break;

        case 'stock-movement':
          const pageNum = parseInt(page as string);
          const limitNum = parseInt(limit as string);
          const startIndex = (pageNum - 1) * limitNum;
          const endIndex = startIndex + limitNum;
          
          let filteredMovements = mockData.stockMovements;
          
          if (dateFrom && dateTo) {
            const fromDate = new Date(dateFrom as string);
            const toDate = new Date(dateTo as string);
            filteredMovements = filteredMovements.filter(movement => 
              movement.date >= fromDate && movement.date <= toDate
            );
          }

          responseData = {
            movements: filteredMovements.slice(startIndex, endIndex),
            pagination: {
              total: filteredMovements.length,
              page: pageNum,
              limit: limitNum,
              totalPages: Math.ceil(filteredMovements.length / limitNum)
            },
            filters: { dateFrom, dateTo, period }
          };
          break;

        case 'low-stock':
          responseData = {
            products: mockData.lowStockProducts,
            summary: {
              totalLowStock: mockData.lowStockProducts.length,
              criticalCount: mockData.lowStockProducts.filter(p => p.status === 'critical').length,
              warningCount: mockData.lowStockProducts.filter(p => p.status === 'warning').length,
              totalValue: mockData.lowStockProducts.reduce((sum, p) => sum + (p.price * p.currentStock), 0)
            }
          };
          break;

        case 'product-analysis':
          responseData = mockData.productAnalysis;
          break;
      }
    }

    return res.status(200).json({
      success: true,
      data: responseData,
      message: `Laporan ${reportType} berhasil diambil${isFromMock ? ' (simulasi)' : ''}`,
      isFromMock,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    operationLogger.error('Get Reports Error', { error: (error as Error).message });
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data laporan',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
}

async function handleCreateReport(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { reportType, parameters, format = 'pdf' } = req.body;

    // Validate required fields
    if (!reportType) {
      return res.status(400).json({
        success: false,
        message: 'Report type is required'
      });
    }

    // Validate report type
    const validReportTypes = ['stock-value', 'stock-movement', 'low-stock', 'product-analysis'];
    if (!validReportTypes.includes(reportType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report type'
      });
    }

    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 200));

    const reportId = `RPT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return res.status(201).json({
      success: true,
      data: {
        reportId,
        reportType,
        format,
        status: 'generated',
        downloadUrl: `/api/inventory/reports/download/${reportId}`,
        generatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      },
      message: 'Laporan berhasil dibuat',
      isFromMock: true
    });

  } catch (error) {
    console.error('Create Report Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal membuat laporan',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
}
