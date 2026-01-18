import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import invoiceAdapter from '@/server/sequelize/adapters/pos-invoice-adapter';
import { logger } from '@/server/monitoring';

const apiLogger = logger.child({ service: 'invoice-detail-api' });

// Mock data untuk invoice detail
const mockInvoiceData = {
  id: "inv-123456",
  invoiceNumber: "INV-2025-05-001",
  prescriptionId: "presc-98765",
  patientName: "Ahmad Sulaiman",
  patientId: "P-12345",
  totalAmount: 125000,
  dispensingFee: 15000,
  tax: 14000,
  grandTotal: 154000,
  status: "PENDING",
  createdAt: new Date().toISOString(),
  items: [
    {
      id: "item-001",
      name: "Paracetamol 500mg",
      quantity: 10,
      unitPrice: 5000,
      subtotal: 50000
    },
    {
      id: "item-002",
      name: "Amoxicillin 500mg",
      quantity: 15,
      unitPrice: 5000,
      subtotal: 75000
    }
  ]
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Hanya method GET yang diizinkan
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Cek autentikasi dengan getServerSession
  const session = await getServerSession(req, res, authOptions);
  
  // Enforce authentication in production
  const isProduction = process.env.NODE_ENV === 'production';
  if (!session) {
    if (isProduction) {
      return res.status(401).json({ error: 'Unauthorized' });
    } else {
      apiLogger.warn('Anonymous access to invoice API in development mode');
      // Continue with default user in development
    }
  }

  // Cek role yang diizinkan
  if (session?.user?.role && !['ADMIN', 'CASHIER', 'PHARMACIST'].includes(session.user.role as string)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  // Setup timeout promise untuk safety
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('API timeout after 5 seconds')), 5000)
  );
  
  const tenantId = (session?.user as any)?.tenantId || 'default';

  const { id } = req.query;
  
  apiLogger.info('GET invoice request received', { invoiceId: id, tenantId });

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid invoice ID' });
  }

  try {
    // Dapatkan invoice dari database menggunakan adapter
    const getInvoicePromise = invoiceAdapter.getInvoiceById(id, tenantId);
    let invoice;
    
    try {
      invoice = await Promise.race([getInvoicePromise, timeoutPromise]) as any;
      
      if (!invoice) {
        // Jika tidak ditemukan, gunakan mock data di development
        if (!isProduction) {
          apiLogger.info(`Invoice ${id} not found, using mock data`);
          invoice = invoiceAdapter.generateMockInvoiceById(id);
          invoice.isMock = true; // Add this line to fix TypeScript error
        } else {
          return res.status(404).json({ error: 'Invoice not found' });
        }
      }
      
      // Log successful response
      apiLogger.info('Successfully retrieved invoice', { 
        invoiceId: id,
        isFromMock: !!invoice.isMock
      });
      
      // Return invoice dengan metadata
      return res.status(200).json({
        ...invoice,
        meta: {
          isFromMock: !!invoice.isMock
        }
      });
    } catch (error: any) {
      apiLogger.error('Error fetching invoice:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Fallback ke mock data di development
      if (!isProduction) {
        apiLogger.info('Using mock invoice data as fallback');
        invoice = invoiceAdapter.generateMockInvoiceById(id) as any;
        
        return res.status(200).json({
          ...invoice,
          meta: {
            isFromMock: true,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        });
      }
      
      // Return error di production
      return res.status(500).json({
        error: 'Failed to fetch invoice',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } catch (error: any) {
    apiLogger.error('Unexpected error in invoice API:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
