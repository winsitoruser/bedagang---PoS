# BEDAGANG - Modern Retail Management Platform

**BEDAGANG** adalah platform manajemen retail modern yang dirancang untuk membantu bisnis retail mengelola operasional mereka dengan lebih efisien. Platform ini menyediakan solusi lengkap untuk Point of Sale (POS), manajemen inventory, purchasing, customer relationship, dan keuangan.

## 🎯 Fitur Utama

### 1. **Point of Sale (POS)**
- Kasir modern dengan interface yang intuitif
- Multi-payment methods (Cash, Card, E-Wallet, QRIS)
- Manajemen shift kasir dan handover
- Diskon dan promosi fleksibel
- Receipt printing dan digital invoice
- Real-time transaction tracking

### 2. **Inventory Management**
- Real-time stock tracking per cabang
- Stock movement audit trail lengkap
- Batch & expiry date tracking
- Low stock alerts dan reorder points
- Stock adjustment dan stock opname
- Reserved stock untuk sales order
- Weighted average cost calculation

### 3. **Purchasing & Procurement**
- Purchase Order (PO) management
- Supplier management
- Goods Receipt processing
- Auto stock update saat penerimaan barang
- PO approval workflow
- Purchase analytics dan reporting

### 4. **Customer Management**
- Customer database lengkap
- Loyalty program dengan tier system
- Point rewards dan redemption
- Customer purchase history
- Customer segmentation
- Membership management

### 5. **Finance & Accounting**
- Dashboard keuangan real-time
- Income & expense tracking
- Accounts Payable (AP)
- Accounts Receivable (AR)
- Financial reports (P&L, Balance Sheet, Cash Flow)
- Multi-currency support
- Tax management

### 6. **Sales Order Management**
- Sales order creation dan tracking
- Stock reservation otomatis
- Order fulfillment workflow
- Shipping management
- Order status tracking
- Customer invoicing

### 7. **Dashboard & Analytics**
- Real-time business metrics
- Sales analytics
- Inventory analytics
- Financial summary
- Custom reports
- Data visualization

## 🚀 Teknologi Stack

### Frontend
- **Next.js 14** - React framework dengan App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Recharts** - Data visualization
- **React Hook Form** - Form management

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Sequelize ORM** - Database ORM
- **PostgreSQL** - Primary database
- **NextAuth.js** - Authentication

### DevOps
- **Docker** - Containerization
- **GitHub Actions** - CI/CD
- **Vercel/Netlify** - Deployment options

## 📦 Instalasi

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm atau yarn

### Setup Development

1. **Clone repository**
```bash
git clone https://github.com/winsitoruser/bedagang.git
cd bedagang
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup database**
```bash
# Create PostgreSQL database
createdb bedagang_dev

# Copy environment file
cp .env.example .env

# Update .env with your database credentials
```

4. **Run migrations**
```bash
npm run migrate
```

5. **Seed database (optional)**
```bash
npm run seed
```

6. **Start development server**
```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

## 🗄️ Database Schema

### Core Tables
- **products** - Master produk
- **categories** - Kategori produk
- **customers** - Data pelanggan
- **employees** - Data karyawan
- **branches** - Data cabang/toko
- **suppliers** - Data supplier

### Inventory Tables
- **stocks** - Level stok per produk/cabang
- **stock_movements** - Audit trail transaksi stok
- **purchase_orders** - Purchase order
- **purchase_order_items** - Item PO
- **goods_receipts** - Penerimaan barang
- **goods_receipt_items** - Item penerimaan
- **sales_orders** - Sales order
- **sales_order_items** - Item SO
- **stock_adjustments** - Penyesuaian stok

### POS Tables
- **pos_transactions** - Transaksi POS
- **pos_transaction_items** - Item transaksi
- **shifts** - Shift kasir
- **shift_handovers** - Serah terima shift

### Loyalty Tables
- **loyalty_programs** - Program loyalty
- **loyalty_tiers** - Tier membership
- **loyalty_rewards** - Reward catalog
- **customer_loyalty** - Data loyalty pelanggan
- **point_transactions** - Transaksi poin
- **reward_redemptions** - Penukaran reward

## 📚 API Documentation

### Inventory Management
- `GET /api/inventory/stock` - Get stock list
- `PUT /api/inventory/stock` - Update stock settings
- `GET /api/inventory/stock/movements` - Get stock movements
- `POST /api/inventory/stock/movements` - Create stock movement
- `GET /api/inventory/purchase-orders` - Get purchase orders
- `POST /api/inventory/purchase-orders` - Create purchase order
- `POST /api/inventory/goods-receipts` - Create goods receipt
- `GET /api/inventory/sales-orders` - Get sales orders
- `POST /api/inventory/sales-orders` - Create sales order

### POS
- `GET /api/pos/shifts` - Get shifts
- `POST /api/pos/shifts` - Open shift
- `POST /api/pos/shifts/:id/close` - Close shift
- `POST /api/pos/shifts/:id/handover` - Shift handover
- `GET /api/pos/transactions` - Get transactions
- `POST /api/pos/transactions` - Create transaction

### Customer & Loyalty
- `GET /api/customers` - Get customers
- `POST /api/customers` - Create customer
- `GET /api/loyalty/programs` - Get loyalty programs
- `POST /api/loyalty/customers/:id/points` - Add/deduct points
- `POST /api/loyalty/rewards/redeem` - Redeem reward

### Finance
- `GET /api/finance/summary` - Financial summary
- `GET /api/finance/dashboard-complete` - Complete dashboard data
- `GET /api/finance/reports/*` - Various financial reports

Dokumentasi lengkap tersedia di folder `/docs`

## 🔐 Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/bedagang_dev
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bedagang_dev
DB_USER=your_user
DB_PASSWORD=your_password

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# App
NODE_ENV=development
PORT=3000
```

## 🏗️ Project Structure

```
bedagang/
├── pages/              # Next.js pages
│   ├── api/           # API routes
│   ├── dashboard/     # Dashboard pages
│   ├── pos/           # POS pages
│   ├── inventory/     # Inventory pages
│   ├── customers/     # Customer pages
│   ├── purchasing/    # Purchasing pages
│   └── finance/       # Finance pages
├── components/        # React components
│   ├── ui/           # UI components
│   ├── dashboard/    # Dashboard components
│   ├── pos/          # POS components
│   └── ...
├── models/           # Sequelize models
├── migrations/       # Database migrations
├── hooks/            # Custom React hooks
├── lib/              # Utility libraries
├── types/            # TypeScript types
├── config/           # Configuration files
└── docs/             # Documentation
```

## 🎨 Design System

Platform ini menggunakan design system modern dengan:
- **Color Palette**: Professional retail theme
- **Typography**: Inter font family
- **Components**: Radix UI primitives
- **Icons**: Lucide React
- **Responsive**: Mobile-first approach

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e
```

## 📈 Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker Deployment
```bash
docker-compose up -d
```

### Vercel Deployment
```bash
vercel --prod
```

## 🤝 Contributing

Kami menerima kontribusi! Silakan buat pull request atau buka issue untuk diskusi.

## 📄 License

MIT License - lihat file LICENSE untuk detail

## 🆘 Support

Untuk bantuan dan pertanyaan:
- Email: support@bedagang.com
- Documentation: https://docs.bedagang.com
- Issues: https://github.com/winsitoruser/bedagang/issues

## 🗺️ Roadmap

### Q1 2026
- ✅ Core POS functionality
- ✅ Inventory management
- ✅ Customer & Loyalty
- ✅ Basic finance module

### Q2 2026
- 🔄 Multi-warehouse support
- 🔄 Advanced reporting
- 🔄 Mobile app (React Native)
- 🔄 E-commerce integration

### Q3 2026
- 📋 HR & Payroll module
- 📋 Advanced analytics & BI
- 📋 API marketplace
- 📋 Third-party integrations

### Q4 2026
- 📋 AI-powered insights
- 📋 Automated reordering
- 📋 Franchise management
- 📋 Multi-tenant support

---

**BEDAGANG** - Solusi Retail Modern untuk Bisnis Indonesia 🇮🇩

Built with ❤️ by Winsitor Team
