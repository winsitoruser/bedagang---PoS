import NextAuth from "next-auth"

// Memperluas tipe default NextAuth untuk menambahkan properti khusus
declare module "next-auth" {
  /**
   * Memperluas tipe User default dari NextAuth
   */
  interface User {
    id?: string
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string // Menambahkan properti role
    tenantId?: string // Menambahkan properti tenantId untuk multi-tenancy
    position?: string
    department?: string
    status?: 'ACTIVE' | 'INACTIVE'
    workLocation?: string
  }

  /**
   * Memperluas tipe Session
   */
  interface Session {
    user?: User
    expires: string
  }
}

// Memperluas JWT bila diperlukan
declare module "next-auth/jwt" {
  /** Memperluas tipe JWT untuk menambahkan properti khusus */
  interface JWT {
    id?: string
    role?: string
    position?: string
    department?: string
    status?: 'ACTIVE' | 'INACTIVE'
    workLocation?: string
  }
}
