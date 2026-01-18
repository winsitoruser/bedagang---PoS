import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';

const PosTransaction = require('../../../../models/PosTransaction');
const PosTransactionItem = require('../../../../models/PosTransactionItem');
const Employee = require('../../../../models/Employee');
const Customer = require('../../../../models/Customer');
const Product = require('../../../../models/Product');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await getTransactions(req, res);
      case 'POST':
        return await createTransaction(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Transaction API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

// GET /api/pos/transactions
async function getTransactions(req: NextApiRequest, res: NextApiResponse) {
  const { 
    shiftId, 
    cashierId, 
    status, 
    startDate, 
    endDate, 
    limit = '50', 
    offset = '0',
    search
  } = req.query;

  const { Op } = require('sequelize');
  const whereClause: any = {};

  if (shiftId) {
    whereClause.shiftId = shiftId;
  }

  if (cashierId) {
    whereClause.cashierId = cashierId;
  }

  if (status) {
    whereClause.status = status;
  }

  if (startDate && endDate) {
    whereClause.transactionDate = {
      [Op.between]: [startDate, endDate]
    };
  } else if (startDate) {
    whereClause.transactionDate = {
      [Op.gte]: startDate
    };
  } else if (endDate) {
    whereClause.transactionDate = {
      [Op.lte]: endDate
    };
  }

  if (search) {
    whereClause[Op.or] = [
      { transactionNumber: { [Op.like]: `%${search}%` } },
      { customerName: { [Op.like]: `%${search}%` } }
    ];
  }

  const transactions = await PosTransaction.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: Employee,
        as: 'cashier',
        attributes: ['id', 'name', 'position']
      },
      {
        model: Customer,
        as: 'customer',
        attributes: ['id', 'name', 'phone', 'email'],
        required: false
      },
      {
        model: PosTransactionItem,
        as: 'items',
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'sku', 'category']
          }
        ]
      }
    ],
    limit: parseInt(limit as string),
    offset: parseInt(offset as string),
    order: [['transactionDate', 'DESC']]
  });

  return res.status(200).json({
    transactions: transactions.rows,
    total: transactions.count,
    limit: parseInt(limit as string),
    offset: parseInt(offset as string)
  });
}

// POST /api/pos/transactions
async function createTransaction(req: NextApiRequest, res: NextApiResponse) {
  const {
    shiftId,
    customerId,
    customerName,
    cashierId,
    items,
    paymentMethod,
    paidAmount,
    discount = 0,
    tax = 0,
    notes
  } = req.body;

  if (!cashierId || !items || items.length === 0 || !paymentMethod || !paidAmount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Generate transaction number
  const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const count = await PosTransaction.count({
    where: {
      transactionDate: {
        [require('sequelize').Op.gte]: new Date().setHours(0, 0, 0, 0)
      }
    }
  });
  const transactionNumber = `TRX${today}${String(count + 1).padStart(4, '0')}`;

  // Calculate totals
  const subtotal = items.reduce((sum: number, item: any) => {
    return sum + (item.quantity * item.unitPrice);
  }, 0);

  const total = subtotal - discount + tax;
  const changeAmount = paidAmount - total;

  if (changeAmount < 0) {
    return res.status(400).json({ error: 'Insufficient payment amount' });
  }

  // Create transaction
  const transaction = await PosTransaction.create({
    transactionNumber,
    shiftId,
    customerId,
    customerName,
    cashierId,
    transactionDate: new Date(),
    subtotal,
    discount,
    tax,
    total,
    paymentMethod,
    paidAmount,
    changeAmount,
    status: 'completed',
    notes
  });

  // Create transaction items
  const transactionItems = await Promise.all(
    items.map((item: any) => {
      const itemSubtotal = (item.quantity * item.unitPrice) - (item.discount || 0);
      return PosTransactionItem.create({
        transactionId: transaction.id,
        productId: item.productId,
        productName: item.productName,
        productSku: item.productSku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        subtotal: itemSubtotal,
        notes: item.notes
      });
    })
  );

  // Fetch created transaction with all details
  const createdTransaction = await PosTransaction.findByPk(transaction.id, {
    include: [
      {
        model: Employee,
        as: 'cashier',
        attributes: ['id', 'name', 'position']
      },
      {
        model: PosTransactionItem,
        as: 'items',
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'sku']
          }
        ]
      }
    ]
  });

  return res.status(201).json({
    message: 'Transaction created successfully',
    transaction: createdTransaction
  });
}
