import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

// Use dynamic import for CommonJS module
const getDb = () => require('../../../models');

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email dan password harus diisi');
        }

        try {
          const db = getDb();
          
          // Find user by email
          const user = await db.User.findOne({
            where: { email: credentials.email }
          });

          if (!user) {
            throw new Error('Email atau password salah');
          }

          // Check if user is active
          if (!user.isActive) {
            throw new Error('Akun Anda tidak aktif. Hubungi administrator.');
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error('Email atau password salah');
          }

          // Update last login
          await user.update({ lastLogin: new Date() });

          // Return user object (without password)
          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            businessName: user.businessName,
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw error;
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/login',
    signOut: '/',
    error: '/auth/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.businessName = user.businessName;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.businessName = token.businessName as string;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || 'bedagang-secret-key-change-in-production',
  debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions);
