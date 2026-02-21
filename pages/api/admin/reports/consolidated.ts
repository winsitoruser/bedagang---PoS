import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { sequelize } from '@/lib/sequelizeClient';
import { QueryTypes } from 'sequelize';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Only super_admin and admin can access consolidated reports
    if (!['super_admin', 'admin'].includes(session.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: 'Insufficient permissions' 
      });
    }

    if (req.method === 'GET') {
      const {
        reportType = 'profit-loss',
        period = 'month',
        startDate,
        endDate,
        branchIds,
        groupBy = 'branch',
        includeDetails = false
      } = req.query;

      // Determine date range
      let dateFilter = '';
      let dateGrouping = '';
      
      if (startDate && endDate) {
        dateFilter = 'AND DATE(transaction_date) BETWEEN :startDate AND :endDate';
        dateGrouping = 'DATE(transaction_date)';
      } else {
        switch (period) {
          case 'today':
            dateFilter = 'AND DATE(transaction_date) = CURRENT_DATE';
            dateGrouping = 'DATE(transaction_date)';
            break;
          case 'week':
            dateFilter = 'AND DATE(transaction_date) >= DATE_TRUNC(\'week\', CURRENT_DATE)';
            dateGrouping = 'DATE_TRUNC(\'day\', transaction_date)';
            break;
          case 'month':
            dateFilter = 'AND DATE(transaction_date) >= DATE_TRUNC(\'month\', CURRENT_DATE)';
            dateGrouping = 'DATE_TRUNC(\'day\', transaction_date)';
            break;
          case 'quarter':
            dateFilter = 'AND DATE(transaction_date) >= DATE_TRUNC(\'quarter\', CURRENT_DATE)';
            dateGrouping = 'DATE_TRUNC(\'week\', transaction_date)';
            break;
          case 'year':
            dateFilter = 'AND DATE(transaction_date) >= DATE_TRUNC(\'year\', CURRENT_DATE)';
            dateGrouping = 'DATE_TRUNC(\'month\', transaction_date)';
            break;
        }
      }

      // Build branch filter
      let branchFilter = '';
      let branchParams: any = {};
      
      if (branchIds && branchIds !== 'all') {
        const parsedBranchIds = Array.isArray(JSON.parse(branchIds as string)) 
          ? JSON.parse(branchIds as string)
          : [branchIds as string];
        
        branchFilter = `AND branch_id IN (${parsedBranchIds.map((_, i) => `:branchId${i}`).join(',')})`;
        parsedBranchIds.forEach((id: string, i: number) => {
          branchParams[`branchId${i}`] = id;
        });
      }

      let data;

      switch (reportType) {
        case 'profit-loss':
          data = await getConsolidatedProfitLoss(
            session.user.tenantId,
            dateFilter,
            dateGrouping,
            branchFilter,
            { ...branchParams },
            groupBy as string,
            includeDetails === 'true'
          );
          break;

        case 'balance-sheet':
          data = await getConsolidatedBalanceSheet(
            session.user.tenantId,
            branchFilter,
            { ...branchParams },
            groupBy as string
          );
          break;

        case 'cash-flow':
          data = await getConsolidatedCashFlow(
            session.user.tenantId,
            dateFilter,
            dateGrouping,
            branchFilter,
            { ...branchParams },
            groupBy as string
          );
          break;

        case 'inter-branch':
          data = await getInterBranchTransactions(
            session.user.tenantId,
            dateFilter,
            branchFilter,
            { ...branchParams }
          );
          break;

        default:
          return res.status(400).json({
            success: false,
            error: 'Invalid report type',
            validTypes: ['profit-loss', 'balance-sheet', 'cash-flow', 'inter-branch']
          });
      }

      // Add metadata
      data.metadata = {
        reportType,
        period,
        dateRange: {
          start: startDate || null,
          end: endDate || null
        },
        groupBy,
        generatedAt: new Date().toISOString(),
        generatedBy: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email
        },
        tenantId: session.user.tenantId
      };

      return res.status(200).json({
        success: true,
        data
      });

    } else {
      return res.status(405).json({ 
        success: false, 
        error: 'Method not allowed' 
      });
    }

  } catch (error: any) {
    console.error('Consolidated report API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

// Get consolidated profit & loss
async function getConsolidatedProfitLoss(
  tenantId: string,
  dateFilter: string,
  dateGrouping: string,
  branchFilter: string,
  params: any,
  groupBy: string,
  includeDetails: boolean
) {
  const { sequelize } = await import('@/lib/sequelizeClient');
  const { QueryTypes } = require('sequelize');

  let groupByClause = '';
  let selectFields = '';

  switch (groupBy) {
    case 'branch':
      groupByClause = 'GROUP BY b.id, b.name, b.code';
      selectFields = 'b.id, b.name, b.code,';
      break;
    case 'region':
      groupByClause = 'GROUP BY b.region';
      selectFields = 'b.region as region, COUNT(DISTINCT b.id) as branch_count,';
      break;
    case 'day':
      groupByClause = 'GROUP BY DATE(transaction_date)';
      selectFields = 'DATE(transaction_date) as date,';
      break;
    case 'month':
      groupByClause = 'GROUP BY DATE_TRUNC(\'month\', transaction_date)';
      selectFields = 'DATE_TRUNC(\'month\', transaction_date) as month,';
      break;
    default:
      groupByClause = '';
      selectFields = '';
  }

  // Get revenue from POS
  const [revenue] = await sequelize.query(`
    SELECT 
      ${selectFields}
      COUNT(DISTINCT pt.id) as transaction_count,
      COUNT(DISTINCT pt.customer_id) as unique_customers,
      COALESCE(SUM(pt.total), 0) as gross_revenue,
      COALESCE(SUM(pt.subtotal), 0) as net_revenue,
      COALESCE(SUM(pt.discount), 0) as total_discount,
      COALESCE(SUM(pt.tax), 0) as total_tax
    FROM pos_transactions pt
    ${groupBy === 'branch' || groupBy === 'region' ? 'JOIN branches b ON pt.branch_id = b.id' : ''}
    WHERE pt.tenant_id = :tenantId
    AND pt.status = 'completed'
    ${dateFilter}
    ${branchFilter}
    ${groupByClause}
  `, {
    replacements: { tenantId, ...params },
    type: QueryTypes.SELECT
  });

  // Get COGS
  const [cogs] = await sequelize.query(`
    SELECT 
      ${selectFields}
      COALESCE(SUM(pti.quantity * p.cost), 0) as total_cogs
    FROM pos_transaction_items pti
    JOIN pos_transactions pt ON pti.transaction_id = pt.id
    JOIN products p ON pti.product_id = p.id
    ${groupBy === 'branch' || groupBy === 'region' ? 'JOIN branches b ON pt.branch_id = b.id' : ''}
    WHERE pt.tenant_id = :tenantId
    AND pt.status = 'completed'
    ${dateFilter.replace('pt.', 'pt.')}
    ${branchFilter.replace('pt.', 'pt.')}
    ${groupByClause}
  `, {
    replacements: { tenantId, ...params },
    type: QueryTypes.SELECT
  });

  // Get expenses
  const expenses = await sequelize.query(`
    SELECT 
      ${groupBy === 'branch' || groupBy === 'region' ? 'b.id, b.name, b.code,' : groupBy === 'region' ? 'b.region,' : ''}
      ft.category,
      COALESCE(SUM(CASE WHEN ft.transaction_type = 'expense' THEN ft.amount ELSE 0 END), 0) as total_expenses
    FROM finance_transactions ft
    ${groupBy === 'branch' || groupBy === 'region' ? 'JOIN branches b ON ft.branch_id = b.id' : ''}
    WHERE ft.tenant_id = :tenantId
    ${dateFilter.replace('transaction_date', 'ft.transaction_date')}
    ${branchFilter.replace('branch_id', 'ft.branch_id')}
    GROUP BY ${groupBy === 'branch' ? 'b.id, b.name, b.code,' : groupBy === 'region' ? 'b.region,' : ''} ft.category
    ORDER BY total_expenses DESC
  `, {
    replacements: { tenantId, ...params },
    type: QueryTypes.SELECT
  });

  // Get inter-branch transactions
  const [interBranch] = await sequelize.query(`
    SELECT 
      ${selectFields}
      COALESCE(SUM(CASE WHEN ibi.from_branch_id = b.id THEN ibi.total_amount ELSE 0 END), 0) as inter_branch_income,
      COALESCE(SUM(CASE WHEN ibi.to_branch_id = b.id THEN ibi.total_amount ELSE 0 END), 0) as inter_branch_expense
    FROM branches b
    LEFT JOIN inter_branch_invoices ibi ON (ibi.from_branch_id = b.id OR ibi.to_branch_id = b.id)
      AND ibi.status = 'paid'
      AND DATE(ibi.invoice_date) >= CURRENT_DATE - INTERVAL '30 days'
    WHERE b.tenant_id = :tenantId
    AND b.is_active = true
    ${branchFilter}
    ${groupByClause}
  `, {
    replacements: { tenantId, ...params },
    type: QueryTypes.SELECT
  });

  // Calculate profit metrics
  const grossProfit = (parseFloat(revenue?.net_revenue || 0) - parseFloat(cogs?.total_cogs || 0));
  const totalExpenses = expenses.reduce((sum: number, e: any) => sum + parseFloat(e.total_expenses), 0);
  const operatingProfit = grossProfit - totalExpenses;
  const netProfit = operatingProfit + 
    (parseFloat(interBranch?.inter_branch_income || 0) - parseFloat(interBranch?.inter_branch_expense || 0));

  return {
    summary: {
      grossRevenue: parseFloat(revenue?.gross_revenue || 0),
      netRevenue: parseFloat(revenue?.net_revenue || 0),
      totalDiscount: parseFloat(revenue?.total_discount || 0),
      totalTax: parseFloat(revenue?.total_tax || 0),
      totalCOGS: parseFloat(cogs?.total_cogs || 0),
      grossProfit,
      totalExpenses,
      operatingProfit,
      interBranchIncome: parseFloat(interBranch?.inter_branch_income || 0),
      interBranchExpense: parseFloat(interBranch?.inter_branch_expense || 0),
      netProfit,
      profitMargin: parseFloat(revenue?.net_revenue || 0) > 0 
        ? (netProfit / parseFloat(revenue?.net_revenue || 0)) * 100 
        : 0,
      transactionCount: parseInt(revenue?.transaction_count || 0),
      uniqueCustomers: parseInt(revenue?.unique_customers || 0)
    },
    expenses,
    details: includeDetails ? {
      revenue: revenue,
      cogs: cogs,
      interBranch: interBranch
    } : null
  };
}

// Get consolidated balance sheet
async function getConsolidatedBalanceSheet(
  tenantId: string,
  branchFilter: string,
  params: any,
  groupBy: string
) {
  const { sequelize } = await import('@/lib/sequelizeClient');
  const { QueryTypes } = require('sequelize');

  // Get current assets
  const [currentAssets] = await sequelize.query(`
    SELECT 
      COALESCE(SUM(p.stock * p.cost), 0) as inventory_value,
      COALESCE(SUM(
        CASE WHEN ft.transaction_type = 'income' 
        AND ft.category IN('cash', 'bank_transfer') 
        THEN ft.amount ELSE 0 END
      ), 0) as cash_and_bank,
      COALESCE(SUM(
        CASE WHEN ibi.to_branch_id = b.id AND ibi.status IN ('sent', 'viewed') 
        THEN ibi.total_amount ELSE 0 END
      ), 0) as inter_branch_receivables
    FROM branches b
    LEFT JOIN products p ON b.id = p.branch_id
    LEFT JOIN finance_transactions ft ON b.id = ft.branch_id
    LEFT JOIN inter_branch_invoices ibi ON b.id = ibi.to_branch_id
    WHERE b.tenant_id = :tenantId
    AND b.is_active = true
    ${branchFilter}
  `, {
    replacements: { tenantId, ...params },
    type: QueryTypes.SELECT
  });

  // Get liabilities
  const [liabilities] = await sequelize.query(`
    SELECT 
      COALESCE(SUM(
        CASE WHEN ft.transaction_type = 'expense' 
        AND ft.category IN('accounts_payable') 
        THEN ft.amount ELSE 0 END
      ), 0) as accounts_payable,
      COALESCE(SUM(
        CASE WHEN ibi.from_branch_id = b.id AND ibi.status IN ('sent', 'viewed') 
        THEN ibi.total_amount ELSE 0 END
      ), 0) as inter_branch_payables
    FROM branches b
    LEFT JOIN finance_transactions ft ON b.id = ft.branch_id
    LEFT JOIN inter_branch_invoices ibi ON b.id = ibi.from_branch_id
    WHERE b.tenant_id = :tenantId
    AND b.is_active = true
    ${branchFilter}
  `, {
    replacements: { tenantId, ...params },
    type: QueryTypes.SELECT
  });

  const totalAssets = parseFloat(currentAssets?.inventory_value || 0) + 
                      parseFloat(currentAssets?.cash_and_bank || 0) + 
                      parseFloat(currentAssets?.inter_branch_receivables || 0);
  
  const totalLiabilities = parseFloat(liabilities?.accounts_payable || 0) + 
                          parseFloat(liabilities?.inter_branch_payables || 0);
  
  const equity = totalAssets - totalLiabilities;

  return {
    assets: {
      current: {
        inventory: parseFloat(currentAssets?.inventory_value || 0),
        cashAndBank: parseFloat(currentAssets?.cash_and_bank || 0),
        interBranchReceivables: parseFloat(currentAssets?.inter_branch_receivables || 0),
        total: totalAssets
      }
    },
    liabilities: {
      current: {
        accountsPayable: parseFloat(liabilities?.accounts_payable || 0),
        interBranchPayables: parseFloat(liabilities?.inter_branch_payables || 0),
        total: totalLiabilities
      }
    },
    equity,
    balanceCheck: Math.abs(totalAssets - (totalLiabilities + equity)) < 0.01
  };
}

// Get consolidated cash flow
async function getConsolidatedCashFlow(
  tenantId: string,
  dateFilter: string,
  dateGrouping: string,
  branchFilter: string,
  params: any,
  groupBy: string
) {
  const { sequelize } = await import('@/lib/sequelizeClient');
  const { QueryTypes } = require('sequelize');

  // Operating cash flows
  const operatingCashFlow = await sequelize.query(`
    SELECT 
      ft.category,
      ft.transaction_type,
      COALESCE(SUM(ft.amount), 0) as total_amount
    FROM finance_transactions ft
    WHERE ft.tenant_id = :tenantId
    AND ft.transaction_date >= CURRENT_DATE - INTERVAL '30 days'
    ${branchFilter.replace('branch_id', 'ft.branch_id')}
    GROUP BY ft.category, ft.transaction_type
    ORDER BY total_amount DESC
  `, {
    replacements: { tenantId, ...params },
    type: QueryTypes.SELECT
  });

  // Calculate cash flow summary
  const cashInflows = operatingCashFlow
    .filter((f: any) => f.transaction_type === 'income')
    .reduce((sum: number, f: any) => sum + parseFloat(f.total_amount), 0);
  
  const cashOutflows = operatingCashFlow
    .filter((f: any) => f.transaction_type === 'expense')
    .reduce((sum: number, f: any) => sum + parseFloat(f.total_amount), 0);

  const netCashFlow = cashInflows - cashOutflows;

  return {
    operating: {
      inflows: cashInflows,
      outflows: cashOutflows,
      net: netCashFlow,
      details: operatingCashFlow
    }
  };
}

// Get inter-branch transactions summary
async function getInterBranchTransactions(
  tenantId: string,
  dateFilter: string,
  branchFilter: string,
  params: any
) {
  const { sequelize } = await import('@/lib/sequelizeClient');
  const { QueryTypes } = require('sequelize');

  const transactions = await sequelize.query(`
    SELECT 
      ibi.invoice_number,
      ibi.invoice_date,
      ibi.total_amount,
      ibi.status,
      fb.name as from_branch_name,
      tb.name as to_branch_name,
      ibi.created_at
    FROM inter_branch_invoices ibi
    JOIN branches fb ON ibi.from_branch_id = fb.id
    JOIN branches tb ON ibi.to_branch_id = tb.id
    WHERE ibi.tenant_id = :tenantId
    AND DATE(ibi.invoice_date) >= CURRENT_DATE - INTERVAL '30 days'
    ORDER BY ibi.created_at DESC
    LIMIT 50
  `, {
    replacements: { tenantId },
    type: QueryTypes.SELECT
  });

  // Calculate settlement summary
  const [settlementSummary] = await sequelize.query(`
    SELECT 
      COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count,
      COUNT(CASE WHEN status = 'sent' THEN 1 END) as pending_count,
      COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_count,
      COALESCE(SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END), 0) as paid_amount,
      COALESCE(SUM(CASE WHEN status != 'paid' THEN total_amount ELSE 0 END), 0) as outstanding_amount
    FROM inter_branch_invoices
    WHERE tenant_id = :tenantId
    AND invoice_date >= CURRENT_DATE - INTERVAL '30 days'
  `, {
    replacements: { tenantId },
    type: QueryTypes.SELECT
  });

  return {
    transactions,
    summary: settlementSummary
  };
}
