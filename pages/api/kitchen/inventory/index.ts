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
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const tenantId = session.user.tenantId;

    if (req.method === 'GET') {
      const { search, status, category } = req.query;

      let whereClause = 'WHERE kii.tenant_id = :tenantId AND kii.is_active = true';
      const replacements: any = { tenantId };

      if (search) {
        whereClause += ' AND (kii.name LIKE :search OR kii.category LIKE :search)';
        replacements.search = `%${search}%`;
      }

      if (status && status !== 'all') {
        whereClause += ' AND kii.status = :status';
        replacements.status = status;
      }

      if (category) {
        whereClause += ' AND kii.category = :category';
        replacements.category = category;
      }

      const items = await sequelize.query(`
        SELECT 
          kii.*,
          w.name as warehouse_name,
          l.name as location_name
        FROM kitchen_inventory_items kii
        LEFT JOIN warehouses w ON kii.warehouse_id = w.id
        LEFT JOIN locations l ON kii.location_id = l.id
        ${whereClause}
        ORDER BY 
          CASE kii.status
            WHEN 'critical' THEN 1
            WHEN 'low' THEN 2
            WHEN 'good' THEN 3
            WHEN 'overstock' THEN 4
          END,
          kii.name ASC
      `, {
        replacements,
        type: QueryTypes.SELECT
      });

      return res.status(200).json({
        success: true,
        data: items
      });

    } else if (req.method === 'POST') {
      const {
        productId,
        name,
        category,
        currentStock,
        unit,
        minStock,
        maxStock,
        reorderPoint,
        unitCost,
        warehouseId,
        locationId
      } = req.body;

      if (!name || !unit || currentStock === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: name, unit, currentStock'
        });
      }

      // Calculate total value and status
      const totalValue = currentStock * (unitCost || 0);
      let status = 'good';
      
      if (currentStock <= 0 || currentStock <= (minStock || 0)) {
        status = 'critical';
      } else if (currentStock <= (reorderPoint || 0)) {
        status = 'low';
      } else if (currentStock >= (maxStock || 999999)) {
        status = 'overstock';
      }

      await sequelize.query(`
        INSERT INTO kitchen_inventory_items (
          id, tenant_id, product_id, name, category, current_stock,
          unit, min_stock, max_stock, reorder_point, unit_cost,
          total_value, status, warehouse_id, location_id,
          last_restocked, is_active, created_at, updated_at
        ) VALUES (
          UUID(), :tenantId, :productId, :name, :category, :currentStock,
          :unit, :minStock, :maxStock, :reorderPoint, :unitCost,
          :totalValue, :status, :warehouseId, :locationId,
          NOW(), true, NOW(), NOW()
        )
      `, {
        replacements: {
          tenantId,
          productId: productId || null,
          name,
          category: category || null,
          currentStock,
          unit,
          minStock: minStock || 0,
          maxStock: maxStock || 999999,
          reorderPoint: reorderPoint || 0,
          unitCost: unitCost || 0,
          totalValue,
          status,
          warehouseId: warehouseId || null,
          locationId: locationId || null
        }
      });

      return res.status(201).json({
        success: true,
        message: 'Inventory item created successfully'
      });

    } else {
      return res.status(405).json({ message: 'Method not allowed' });
    }

  } catch (error: any) {
    console.error('Error in kitchen inventory API:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}
