import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

const Product = require('../../../models/Product');
const { Op } = require('sequelize');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (req.method === 'GET') {
      return await getProducts(req, res);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('POS Products API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

async function getProducts(req: NextApiRequest, res: NextApiResponse) {
  const { search = '', category = '' } = req.query;

  const whereClause: any = {
    isActive: true,
    stock: { [Op.gt]: 0 } // Only show products with stock
  };

  if (search) {
    whereClause[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { sku: { [Op.like]: `%${search}%` } },
      { barcode: { [Op.like]: `%${search}%` } }
    ];
  }

  if (category && category !== 'Semua') {
    whereClause.category = category;
  }

  const products = await Product.findAll({
    where: whereClause,
    attributes: ['id', 'name', 'sku', 'barcode', 'category', 'price', 'stock', 'unit', 'image'],
    order: [['name', 'ASC']]
  });

  // Get unique categories
  const allProducts = await Product.findAll({
    where: { isActive: true },
    attributes: ['category'],
    group: ['category']
  });

  const categories = ['Semua', ...allProducts.map((p: any) => p.category).filter(Boolean)];

  return res.status(200).json({
    success: true,
    products: products.map((p: any) => ({
      id: p.id.toString(),
      name: p.name,
      sku: p.sku,
      barcode: p.barcode,
      category: p.category || 'Umum',
      price: parseFloat(p.price) || 0,
      stock: parseInt(p.stock) || 0,
      unit: p.unit || 'pcs',
      image: p.image
    })),
    categories
  });
}
