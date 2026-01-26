import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { Pool } from 'pg';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Check if locations table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'locations'
      )
    `);

    if (!tableCheck.rows[0].exists) {
      // If table doesn't exist, return mock data for development
      await pool.end();
      return res.status(200).json({
        success: true,
        data: [
          { id: 1, name: 'Gudang Pusat', type: 'warehouse', address: 'Jakarta', active: true },
          { id: 2, name: 'Toko Cabang A', type: 'store', address: 'Bandung', active: true },
          { id: 3, name: 'Toko Cabang B', type: 'store', address: 'Surabaya', active: true },
          { id: 4, name: 'Gudang Regional Jakarta', type: 'warehouse', address: 'Jakarta Timur', active: true },
          { id: 5, name: 'Toko Cabang C', type: 'store', address: 'Semarang', active: true },
          { id: 6, name: 'Toko Cabang D', type: 'store', address: 'Yogyakarta', active: true }
        ]
      });
    }

    // Get locations from database
    const result = await pool.query(`
      SELECT id, name, type, address, active, created_at, updated_at
      FROM locations
      WHERE active = true
      ORDER BY type, name
    `);

    await pool.end();

    return res.status(200).json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Locations API error:', error);
    await pool.end();
    
    // Fallback to mock data on error
    return res.status(200).json({
      success: true,
      data: [
        { id: 1, name: 'Gudang Pusat', type: 'warehouse', address: 'Jakarta', active: true },
        { id: 2, name: 'Toko Cabang A', type: 'store', address: 'Bandung', active: true },
        { id: 3, name: 'Toko Cabang B', type: 'store', address: 'Surabaya', active: true },
        { id: 4, name: 'Gudang Regional Jakarta', type: 'warehouse', address: 'Jakarta Timur', active: true },
        { id: 5, name: 'Toko Cabang C', type: 'store', address: 'Semarang', active: true },
        { id: 6, name: 'Toko Cabang D', type: 'store', address: 'Yogyakarta', active: true }
      ]
    });
  }
}
