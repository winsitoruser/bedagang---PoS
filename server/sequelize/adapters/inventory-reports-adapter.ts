import { Sequelize, QueryTypes } from 'sequelize';

export interface StockReport {
  productId: string;
  productName: string;
  sku: string;
  category: string;
  currentStock: number;
  reorderPoint: number;
  stockValue: number;
  lastUpdated: string;
}

export interface StockMovementReport {
  date: string;
  productId: string;
  productName: string;
  movementType: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  reference: string;
  notes: string;
}

export interface LowStockReport {
  productId: string;
  productName: string;
  sku: string;
  currentStock: number;
  reorderPoint: number;
  deficit: number;
  supplier: string;
}

export interface ExpiryReport {
  productId: string;
  productName: string;
  sku: string;
  batchNumber: string;
  expiryDate: string;
  daysUntilExpiry: number;
  quantity: number;
  status: 'expired' | 'expiring_soon' | 'ok';
}

export interface StockValueReport {
  totalValue: number;
  totalProducts: number;
  averageValue: number;
  categoryBreakdown: Array<{
    category: string;
    value: number;
    percentage: number;
  }>;
}

class InventoryReportsAdapter {
  private sequelize: Sequelize;

  constructor(sequelize: Sequelize) {
    this.sequelize = sequelize;
  }

  async getStockReport(filters: {
    category?: string;
    lowStock?: boolean;
    search?: string;
  } = {}): Promise<StockReport[]> {
    const { category, lowStock, search } = filters;
    
    let whereClause = 'WHERE 1=1';
    const replacements: any = {};

    if (category) {
      whereClause += ' AND p.category = :category';
      replacements.category = category;
    }

    if (lowStock) {
      whereClause += ' AND p.stock <= p.reorder_point';
    }

    if (search) {
      whereClause += ' AND (p.name ILIKE :search OR p.sku ILIKE :search)';
      replacements.search = `%${search}%`;
    }

    const query = `
      SELECT 
        p.id as "productId",
        p.name as "productName",
        p.sku,
        p.category,
        p.stock as "currentStock",
        p.reorder_point as "reorderPoint",
        (p.stock * p.price) as "stockValue",
        p.updated_at as "lastUpdated"
      FROM products p
      ${whereClause}
      ORDER BY p.name
    `;

    const results = await this.sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT
    });

    return results as StockReport[];
  }

  async getStockMovementReport(filters: {
    startDate?: string;
    endDate?: string;
    productId?: string;
    movementType?: string;
  } = {}): Promise<StockMovementReport[]> {
    const { startDate, endDate, productId, movementType } = filters;
    
    let whereClause = 'WHERE 1=1';
    const replacements: any = {};

    if (startDate) {
      whereClause += ' AND sm.created_at >= :startDate';
      replacements.startDate = startDate;
    }

    if (endDate) {
      whereClause += ' AND sm.created_at <= :endDate';
      replacements.endDate = endDate;
    }

    if (productId) {
      whereClause += ' AND sm.product_id = :productId';
      replacements.productId = productId;
    }

    if (movementType) {
      whereClause += ' AND sm.movement_type = :movementType';
      replacements.movementType = movementType;
    }

    const query = `
      SELECT 
        DATE(sm.created_at) as date,
        sm.product_id as "productId",
        p.name as "productName",
        sm.movement_type as "movementType",
        sm.quantity,
        sm.reference,
        sm.notes
      FROM stock_movements sm
      JOIN products p ON p.id = sm.product_id
      ${whereClause}
      ORDER BY sm.created_at DESC
      LIMIT 1000
    `;

    const results = await this.sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT
    });

    return results as StockMovementReport[];
  }

  async getLowStockReport(): Promise<LowStockReport[]> {
    const query = `
      SELECT 
        p.id as "productId",
        p.name as "productName",
        p.sku,
        p.stock as "currentStock",
        p.reorder_point as "reorderPoint",
        (p.reorder_point - p.stock) as deficit,
        s.name as supplier
      FROM products p
      LEFT JOIN suppliers s ON s.id = p.supplier_id
      WHERE p.stock <= p.reorder_point
      ORDER BY deficit DESC
    `;

    const results = await this.sequelize.query(query, {
      type: QueryTypes.SELECT
    });

    return results as LowStockReport[];
  }

  async getExpiryReport(daysAhead: number = 90): Promise<ExpiryReport[]> {
    const query = `
      SELECT 
        p.id as "productId",
        p.name as "productName",
        p.sku,
        pb.batch_number as "batchNumber",
        pb.expiry_date as "expiryDate",
        (pb.expiry_date - CURRENT_DATE) as "daysUntilExpiry",
        pb.quantity,
        CASE 
          WHEN pb.expiry_date < CURRENT_DATE THEN 'expired'
          WHEN pb.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'expiring_soon'
          ELSE 'ok'
        END as status
      FROM product_batches pb
      JOIN products p ON p.id = pb.product_id
      WHERE pb.expiry_date <= CURRENT_DATE + INTERVAL ':daysAhead days'
      ORDER BY pb.expiry_date ASC
    `;

    const results = await this.sequelize.query(query, {
      replacements: { daysAhead },
      type: QueryTypes.SELECT
    });

    return results as ExpiryReport[];
  }

  async getStockValueReport(): Promise<StockValueReport> {
    const totalQuery = `
      SELECT 
        SUM(p.stock * p.price) as "totalValue",
        COUNT(*) as "totalProducts",
        AVG(p.stock * p.price) as "averageValue"
      FROM products p
      WHERE p.stock > 0
    `;

    const categoryQuery = `
      SELECT 
        p.category,
        SUM(p.stock * p.price) as value
      FROM products p
      WHERE p.stock > 0
      GROUP BY p.category
      ORDER BY value DESC
    `;

    const [totalResults, categoryResults] = await Promise.all([
      this.sequelize.query(totalQuery, { type: QueryTypes.SELECT }),
      this.sequelize.query(categoryQuery, { type: QueryTypes.SELECT })
    ]);

    const totals = totalResults[0] as any;
    const totalValue = parseFloat(totals.totalValue) || 0;

    const categoryBreakdown = (categoryResults as any[]).map(cat => ({
      category: cat.category,
      value: parseFloat(cat.value),
      percentage: totalValue > 0 ? (parseFloat(cat.value) / totalValue) * 100 : 0
    }));

    return {
      totalValue,
      totalProducts: parseInt(totals.totalProducts) || 0,
      averageValue: parseFloat(totals.averageValue) || 0,
      categoryBreakdown
    };
  }

  async getInventorySummary() {
    const query = `
      SELECT 
        COUNT(*) as "totalProducts",
        SUM(stock) as "totalStock",
        SUM(stock * price) as "totalValue",
        COUNT(CASE WHEN stock <= reorder_point THEN 1 END) as "lowStockCount",
        COUNT(CASE WHEN stock = 0 THEN 1 END) as "outOfStockCount"
      FROM products
    `;

    const results = await this.sequelize.query(query, {
      type: QueryTypes.SELECT
    });

    return results[0];
  }
}

export default InventoryReportsAdapter;
