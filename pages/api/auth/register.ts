import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';

// Dynamic import for CommonJS module
const getDb = () => require('../../../models');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const db = getDb();
    const { name, email, phone, businessName, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nama, email, dan password wajib diisi' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password minimal 6 karakter' });
    }

    // Check if user already exists
    const existingUser = await db.User.findOne({ where: { email } });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await db.User.create({
      name,
      email,
      phone: phone || null,
      businessName: businessName || null,
      password: hashedPassword,
      role: 'owner', // Default role
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user.toJSON();

    return res.status(201).json({
      message: 'Registrasi berhasil',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ 
      message: 'Terjadi kesalahan saat registrasi',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
}
