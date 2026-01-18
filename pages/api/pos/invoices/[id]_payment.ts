import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import invoiceAdapter from '@/server/sequelize/adapters/pos-invoice-adapter';
import { logger } from '@/server/monitoring';

const apiLogger = logger.child({ service: 'invoice-payment-api' });

type PaymentData = {
  paymentMethod: 'CASH' | 'CARD' | 'TRANSFER' | 'QRIS';
  amountPaid: number;
  referenceNumber?: string; // Untuk metode selain cash
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Hanya method POST yang diizinkan
  if (req.method !== 'POST') {
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
      apiLogger.warn('Anonymous access to invoice payment API in development mode');
      // Continue with default user in development
    }
  }

  // Cek role yang diizinkan
  if (session?.user?.role && !['ADMIN', 'CASHIER'].includes(session.user.role as string)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  // Setup timeout promise untuk safety
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('API timeout after 10 seconds')), 10000)
  );
  
  const tenantId = (session?.user as any)?.tenantId || 'default';
  const userId = (session?.user as any)?.id || 'test-user-id';

  const { id } = req.query;
  
  apiLogger.info('POST invoice payment request received', { invoiceId: id, tenantId });

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid invoice ID' });
  }

  try {
    // Dapatkan data pembayaran dari body request
    const paymentData: PaymentData = req.body;
    
    if (!paymentData || !paymentData.paymentMethod) {
      return res.status(400).json({ error: 'Payment method is required' });
    }

    // Validasi jumlah pembayaran (khusus metode CASH)
    if (paymentData.paymentMethod === 'CASH' && !paymentData.amountPaid) {
      return res.status(400).json({ error: 'Amount paid is required for cash payments' });
    }

    // Dapatkan invoice dari database menggunakan adapter
    const getInvoicePromise = invoiceAdapter.getInvoiceById(id, tenantId);
    let invoice;
    
    try {
      invoice = await Promise.race([getInvoicePromise, timeoutPromise]) as any;
      
      if (!invoice) {
        if (isProduction) {
          return res.status(404).json({ error: 'Invoice not found' });
        } else {
          // Jika development, gunakan mock data
          apiLogger.info(`Invoice ${id} not found, using mock data for development`);
          invoice = invoiceAdapter.generateMockInvoiceById(id);
        }
      }
      
      // Cek status invoice
      if (invoice.status === 'PAID') {
        return res.status(400).json({ error: 'Invoice is already paid' });
      }

      if (invoice.status === 'CANCELLED') {
        return res.status(400).json({ error: 'Cannot process payment for cancelled invoice' });
      }

      // Validasi jumlah pembayaran untuk metode CASH
      if (paymentData.paymentMethod === 'CASH' && paymentData.amountPaid < invoice.grandTotal) {
        return res.status(400).json({ error: 'Insufficient payment amount' });
      }
    } catch (error: any) {
      apiLogger.error('Error fetching invoice:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      if (isProduction) {
        return res.status(500).json({
          error: 'Failed to fetch invoice',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
      
      // Fallback untuk development
      apiLogger.info(`Using mock invoice for ${id} due to fetch error`);
      invoice = invoiceAdapter.generateMockInvoiceById(id);
    }

    // Proses pembayaran menggunakan adapter
    const updatePaymentPromise = invoiceAdapter.updateInvoicePayment(
      id,
      {
        amount: paymentData.amountPaid,
        method: paymentData.paymentMethod,
        reference: paymentData.referenceNumber
      },
      tenantId,
      userId
    );
    
    let updatedInvoice;
    
    try {
      updatedInvoice = await Promise.race([updatePaymentPromise, timeoutPromise]) as any;
      
      if (!updatedInvoice) {
        if (isProduction) {
          return res.status(500).json({ error: 'Failed to process payment' });
        } else {
          // Mock data untuk development
          apiLogger.info('Using mock payment processing response for development');
          updatedInvoice = {
            ...invoice,
            status: 'PAID',
            paidAt: new Date().toISOString(),
            paymentMethod: paymentData.paymentMethod,
            isMock: true
          };
        }
      }
      
      apiLogger.info('Payment processed successfully', {
        invoiceId: id,
        method: paymentData.paymentMethod,
        isFromMock: !!updatedInvoice.isMock
      });
      
      return res.status(200).json({
        ...updatedInvoice,
        meta: {
          isFromMock: !!updatedInvoice.isMock,
          paymentProcessed: true
        }
      });
      
    } catch (error: any) {
      apiLogger.error('Error processing payment:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      if (isProduction) {
        return res.status(500).json({
          error: 'Failed to process payment',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
      
      // Fallback mode - simulasi pembayaran untuk testing
      apiLogger.info('Using mock invoice payment processing');
      
      // Mock data untuk invoice yang sudah dibayar
      const paidMockInvoice = {
        id: id as string,
        invoiceNumber: "INV-2025-05-001",
        prescriptionId: "presc-98765",
        patientName: "Ahmad Sulaiman",
        patientId: "P-12345",
        totalAmount: 125000,
        dispensingFee: 15000,
        tax: 14000,
        grandTotal: 154000,
        status: "PAID",
        createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 jam yang lalu
        paidAt: new Date().toISOString(),
        paymentMethod: paymentData.paymentMethod,
        amountPaid: paymentData.amountPaid,
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
        ],
        isMock: true
      };
      
      return res.status(200).json({
        ...paidMockInvoice,
        meta: {
          isFromMock: true,
          paymentProcessed: true,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  } catch (error: any) {
    apiLogger.error('Unexpected error in invoice payment API:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    if (isProduction) {
      return res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    // Fallback untuk development
    const paymentData: PaymentData = req.body;
    const paidMockInvoice = {
      id: id as string,
      invoiceNumber: "INV-2025-05-001",
      status: "PAID",
      paidAt: new Date().toISOString(),
      paymentMethod: paymentData.paymentMethod,
      isMock: true
    };
    
    return res.status(200).json({
      ...paidMockInvoice,
      meta: {
        isFromMock: true,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
}
