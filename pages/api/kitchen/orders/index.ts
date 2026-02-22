import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { sequelize } from '@/lib/sequelizeClient';
import { QueryTypes } from 'sequelize';

const KitchenOrder = require('@/models/KitchenOrder');
const KitchenOrderItem = require('@/models/KitchenOrderItem');
const KitchenStaff = require('@/models/KitchenStaff');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const tenantId = session.user.tenantId || 'default';

    if (req.method === 'GET') {
      const { status, orderType, search, limit = 50, offset = 0 } = req.query;

      try {
        let whereClause = 'WHERE 1=1';
        const replacements: any = {};

        if (status && status !== 'all') {
          whereClause += ' AND ko.status = :status';
          replacements.status = status;
        }

        if (orderType && orderType !== 'all') {
          whereClause += ' AND ko.order_type = :orderType';
          replacements.orderType = orderType;
        }

        if (search) {
          whereClause += ' AND (ko.order_number LIKE :search OR ko.table_number LIKE :search OR ko.customer_name LIKE :search)';
          replacements.search = `%${search}%`;
        }

        const orders = await sequelize.query(`
          SELECT 
            ko.id, ko.order_number, ko.table_number, ko.order_type,
            ko.customer_name, ko.status, ko.priority, ko.received_at,
            ko.started_at, ko.completed_at, ko.served_at,
            ko.estimated_time, ko.actual_prep_time, ko.total_amount, ko.notes
          FROM kitchen_orders ko
          ${whereClause}
          ORDER BY ko.received_at DESC
          LIMIT :limit OFFSET :offset
        `, {
          replacements: { ...replacements, limit: parseInt(limit as string), offset: parseInt(offset as string) },
          type: QueryTypes.SELECT
        });

        // Get items for each order
        const ordersWithItems = await Promise.all(orders.map(async (order: any) => {
          try {
            const items = await sequelize.query(`
              SELECT id, name, quantity, notes, modifiers, status
              FROM kitchen_order_items WHERE kitchen_order_id = :orderId
            `, {
              replacements: { orderId: order.id },
              type: QueryTypes.SELECT
            });
            return { ...order, items };
          } catch {
            return { ...order, items: [] };
          }
        }));

        return res.status(200).json({ success: true, data: ordersWithItems });
      } catch (queryError: any) {
        console.error('Kitchen orders query error:', queryError);
        return res.status(200).json({ success: true, data: [] });
      }

    } else if (req.method === 'POST') {
      // Create new kitchen order
      const {
        orderNumber,
        posTransactionId,
        tableNumber,
        orderType,
        customerName,
        priority,
        estimatedTime,
        items,
        notes,
        totalAmount
      } = req.body;

      // Validate required fields
      if (!orderNumber || !orderType || !items || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: orderNumber, orderType, items'
        });
      }

      // Start transaction
      const transaction = await sequelize.transaction();

      try {
        // Create kitchen order
        const [order] = await sequelize.query(`
          INSERT INTO kitchen_orders (
            id, tenant_id, order_number, pos_transaction_id, table_number,
            order_type, customer_name, status, priority, received_at,
            estimated_time, notes, total_amount, created_at, updated_at
          ) VALUES (
            UUID(), :tenantId, :orderNumber, :posTransactionId, :tableNumber,
            :orderType, :customerName, 'new', :priority, NOW(),
            :estimatedTime, :notes, :totalAmount, NOW(), NOW()
          )
        `, {
          replacements: {
            tenantId,
            orderNumber,
            posTransactionId: posTransactionId || null,
            tableNumber: tableNumber || null,
            orderType,
            customerName: customerName || null,
            priority: priority || 'normal',
            estimatedTime: estimatedTime || 15,
            notes: notes || null,
            totalAmount: totalAmount || null
          },
          transaction
        });

        // Get the created order ID
        const [createdOrder]: any = await sequelize.query(`
          SELECT id FROM kitchen_orders WHERE order_number = :orderNumber AND tenant_id = :tenantId
        `, {
          replacements: { orderNumber, tenantId },
          type: QueryTypes.SELECT,
          transaction
        });

        // Create order items
        for (const item of items) {
          await sequelize.query(`
            INSERT INTO kitchen_order_items (
              id, kitchen_order_id, product_id, recipe_id, name, quantity,
              notes, modifiers, status, created_at, updated_at
            ) VALUES (
              UUID(), :orderId, :productId, :recipeId, :name, :quantity,
              :notes, :modifiers, 'pending', NOW(), NOW()
            )
          `, {
            replacements: {
              orderId: createdOrder.id,
              productId: item.productId || null,
              recipeId: item.recipeId || null,
              name: item.name,
              quantity: item.quantity,
              notes: item.notes || null,
              modifiers: item.modifiers ? JSON.stringify(item.modifiers) : null
            },
            transaction
          });
        }

        await transaction.commit();

        return res.status(201).json({
          success: true,
          message: 'Kitchen order created successfully',
          data: {
            id: createdOrder.id,
            orderNumber
          }
        });

      } catch (error) {
        await transaction.rollback();
        throw error;
      }

    } else {
      return res.status(405).json({ message: 'Method not allowed' });
    }

  } catch (error: any) {
    console.error('Error in kitchen orders API:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}
