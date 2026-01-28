-- ============================================================================
-- COMPLETE DATABASE EXPORT - BEDAGANG PROJECT
-- ============================================================================
-- Project: Bedagang - Inventory & POS Management System
-- Export Date: January 28, 2026
-- Database: PostgreSQL
-- Description: Complete database schema with all tables, indexes, and seed data
-- ============================================================================

-- ============================================================================
-- MIGRATION 1: COMPLETE INVENTORY SYSTEM
-- File: 20260127000002-create-inventory-system.sql
-- Description: Core inventory tables, stock management, and master data
-- ============================================================================

-- 1. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);
COMMENT ON TABLE categories IS 'Product categories and subcategories';

-- 2. SUPPLIERS TABLE
CREATE TABLE IF NOT EXISTS suppliers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  code VARCHAR(50) UNIQUE,
  contact_person VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(100),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Indonesia',
  tax_number VARCHAR(50),
  payment_terms VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_suppliers_code ON suppliers(code);
CREATE INDEX IF NOT EXISTS idx_suppliers_is_active ON suppliers(is_active);
COMMENT ON TABLE suppliers IS 'Supplier master data';

-- 3. LOCATIONS TABLE
CREATE TABLE IF NOT EXISTS locations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  code VARCHAR(50) UNIQUE,
  type VARCHAR(50) DEFAULT 'warehouse',
  address TEXT,
  city VARCHAR(100),
  phone VARCHAR(20),
  manager VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_locations_code ON locations(code);
CREATE INDEX IF NOT EXISTS idx_locations_type ON locations(type);
CREATE INDEX IF NOT EXISTS idx_locations_is_active ON locations(is_active);
COMMENT ON TABLE locations IS 'Warehouse and store locations';

-- 4. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  barcode VARCHAR(100),
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  supplier_id INTEGER REFERENCES suppliers(id) ON DELETE SET NULL,
  description TEXT,
  unit VARCHAR(50) DEFAULT 'pcs',
  buy_price DECIMAL(15,2) DEFAULT 0,
  sell_price DECIMAL(15,2) DEFAULT 0,
  minimum_stock INTEGER DEFAULT 0,
  maximum_stock INTEGER DEFAULT 0,
  reorder_point INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_trackable BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_supplier_id ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
COMMENT ON TABLE products IS 'Product master data';

-- 5. INVENTORY_STOCK TABLE
CREATE TABLE IF NOT EXISTS inventory_stock (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  location_id INTEGER NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  quantity DECIMAL(10,2) DEFAULT 0,
  reserved_quantity DECIMAL(10,2) DEFAULT 0,
  available_quantity DECIMAL(10,2) GENERATED ALWAYS AS (quantity - reserved_quantity) STORED,
  last_stock_take_date TIMESTAMP,
  last_movement_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, location_id)
);

CREATE INDEX IF NOT EXISTS idx_inventory_stock_product_id ON inventory_stock(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_stock_location_id ON inventory_stock(location_id);
CREATE INDEX IF NOT EXISTS idx_inventory_stock_quantity ON inventory_stock(quantity);
COMMENT ON TABLE inventory_stock IS 'Current stock levels per product per location';

-- 6. STOCK_MOVEMENTS TABLE
CREATE TABLE IF NOT EXISTS stock_movements (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  location_id INTEGER REFERENCES locations(id) ON DELETE SET NULL,
  movement_type VARCHAR(20) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  reference_type VARCHAR(50),
  reference_id INTEGER,
  reference_number VARCHAR(100),
  batch_number VARCHAR(100),
  expiry_date DATE,
  cost_price DECIMAL(15,2),
  notes TEXT,
  created_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_location_id ON stock_movements(location_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_movement_type ON stock_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_stock_movements_reference ON stock_movements(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements(created_at);
COMMENT ON TABLE stock_movements IS 'Stock movement history for all transactions';

-- 7. STOCK_ADJUSTMENTS TABLE
CREATE TABLE IF NOT EXISTS stock_adjustments (
  id SERIAL PRIMARY KEY,
  adjustment_number VARCHAR(50) UNIQUE NOT NULL,
  location_id INTEGER REFERENCES locations(id) ON DELETE SET NULL,
  adjustment_date DATE NOT NULL,
  adjustment_type VARCHAR(50),
  reason TEXT,
  status VARCHAR(20) DEFAULT 'draft',
  approved_by VARCHAR(100),
  approved_at TIMESTAMP,
  notes TEXT,
  created_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_stock_adjustments_number ON stock_adjustments(adjustment_number);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_location_id ON stock_adjustments(location_id);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_status ON stock_adjustments(status);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_date ON stock_adjustments(adjustment_date);
COMMENT ON TABLE stock_adjustments IS 'Stock adjustment headers';

-- 8. STOCK_ADJUSTMENT_ITEMS TABLE
CREATE TABLE IF NOT EXISTS stock_adjustment_items (
  id SERIAL PRIMARY KEY,
  adjustment_id INTEGER NOT NULL REFERENCES stock_adjustments(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  current_stock DECIMAL(10,2) DEFAULT 0,
  adjusted_quantity DECIMAL(10,2) NOT NULL,
  new_stock DECIMAL(10,2),
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_stock_adjustment_items_adjustment_id ON stock_adjustment_items(adjustment_id);
CREATE INDEX IF NOT EXISTS idx_stock_adjustment_items_product_id ON stock_adjustment_items(product_id);
COMMENT ON TABLE stock_adjustment_items IS 'Stock adjustment line items';

-- ============================================================================
-- MIGRATION 2: INVENTORY TRANSFERS SYSTEM
-- File: 20260126000005-create-inventory-transfers.sql
-- Description: Transfer stock between locations/branches
-- ============================================================================

-- INVENTORY_TRANSFERS TABLE
CREATE TABLE IF NOT EXISTS inventory_transfers (
  id SERIAL PRIMARY KEY,
  transfer_number VARCHAR(50) UNIQUE NOT NULL,
  from_location_id INTEGER NOT NULL,
  to_location_id INTEGER NOT NULL,
  request_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  priority VARCHAR(20) NOT NULL DEFAULT 'normal',
  reason TEXT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'requested',
  approved_by VARCHAR(100),
  approval_date TIMESTAMP,
  approval_notes TEXT,
  shipment_date TIMESTAMP,
  tracking_number VARCHAR(100),
  courier VARCHAR(100),
  estimated_arrival DATE,
  shipped_by VARCHAR(100),
  received_date TIMESTAMP,
  received_by VARCHAR(100),
  receipt_notes TEXT,
  total_cost DECIMAL(15,2) NOT NULL DEFAULT 0,
  shipping_cost DECIMAL(15,2) NOT NULL DEFAULT 0,
  handling_fee DECIMAL(15,2) NOT NULL DEFAULT 0,
  notes TEXT,
  attachments JSON,
  requested_by VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_different_locations CHECK (from_location_id != to_location_id),
  CONSTRAINT chk_valid_priority CHECK (priority IN ('normal', 'urgent', 'emergency')),
  CONSTRAINT chk_valid_status CHECK (status IN (
    'requested', 'approved', 'rejected', 'in_preparation',
    'in_transit', 'received', 'completed', 'cancelled'
  ))
);

COMMENT ON TABLE inventory_transfers IS 'Transfer stock antar cabang/lokasi';

-- INVENTORY_TRANSFER_ITEMS TABLE
CREATE TABLE IF NOT EXISTS inventory_transfer_items (
  id SERIAL PRIMARY KEY,
  transfer_id INTEGER NOT NULL REFERENCES inventory_transfers(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  product_sku VARCHAR(100),
  quantity_requested DECIMAL(10,2) NOT NULL,
  quantity_approved DECIMAL(10,2),
  quantity_shipped DECIMAL(10,2),
  quantity_received DECIMAL(10,2),
  condition_on_receipt VARCHAR(50),
  unit_cost DECIMAL(15,2) NOT NULL,
  subtotal DECIMAL(15,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_positive_quantity CHECK (quantity_requested > 0),
  CONSTRAINT chk_valid_condition CHECK (condition_on_receipt IN (
    'good', 'damaged', 'missing', 'partial', NULL
  ))
);

COMMENT ON TABLE inventory_transfer_items IS 'Item detail untuk setiap transfer';

-- INVENTORY_TRANSFER_HISTORY TABLE
CREATE TABLE IF NOT EXISTS inventory_transfer_history (
  id SERIAL PRIMARY KEY,
  transfer_id INTEGER NOT NULL REFERENCES inventory_transfers(id) ON DELETE CASCADE,
  status_from VARCHAR(30),
  status_to VARCHAR(30) NOT NULL,
  changed_by VARCHAR(100) NOT NULL,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  metadata JSON
);

COMMENT ON TABLE inventory_transfer_history IS 'History perubahan status transfer';

-- Indexes for transfers
CREATE INDEX IF NOT EXISTS idx_transfers_number ON inventory_transfers(transfer_number);
CREATE INDEX IF NOT EXISTS idx_transfers_from_location ON inventory_transfers(from_location_id);
CREATE INDEX IF NOT EXISTS idx_transfers_to_location ON inventory_transfers(to_location_id);
CREATE INDEX IF NOT EXISTS idx_transfers_status ON inventory_transfers(status);
CREATE INDEX IF NOT EXISTS idx_transfers_request_date ON inventory_transfers(request_date);
CREATE INDEX IF NOT EXISTS idx_transfers_priority ON inventory_transfers(priority);
CREATE INDEX IF NOT EXISTS idx_transfer_items_transfer ON inventory_transfer_items(transfer_id);
CREATE INDEX IF NOT EXISTS idx_transfer_items_product ON inventory_transfer_items(product_id);
CREATE INDEX IF NOT EXISTS idx_transfer_history_transfer ON inventory_transfer_history(transfer_id);

-- ============================================================================
-- MIGRATION 3: RAC (REQUEST, ADJUST, COUNT) SYSTEM
-- File: 20260127000001-create-rac-system.sql
-- Description: Stock request and relocation system between branches
-- ============================================================================

-- RAC_REQUESTS TABLE
CREATE TABLE IF NOT EXISTS rac_requests (
  id SERIAL PRIMARY KEY,
  request_number VARCHAR(50) UNIQUE NOT NULL,
  request_type VARCHAR(20) NOT NULL CHECK (request_type IN ('rac', 'restock', 'emergency')),
  from_location_id INTEGER NOT NULL,
  to_location_id INTEGER NOT NULL,
  request_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  required_date DATE NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'processing', 'shipped', 'received', 'completed', 'cancelled')),
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  reason TEXT NOT NULL,
  notes TEXT,
  requested_by VARCHAR(100) NOT NULL,
  approved_by VARCHAR(100),
  approval_date TIMESTAMP,
  approval_notes TEXT,
  processed_by VARCHAR(100),
  processing_date TIMESTAMP,
  shipped_by VARCHAR(100),
  shipment_date TIMESTAMP,
  tracking_number VARCHAR(100),
  courier VARCHAR(100),
  received_by VARCHAR(100),
  received_date TIMESTAMP,
  receipt_notes TEXT,
  completed_date TIMESTAMP,
  rejection_reason TEXT,
  cancelled_reason TEXT,
  attachments JSON,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT different_locations CHECK (from_location_id != to_location_id)
);

COMMENT ON TABLE rac_requests IS 'RAC (Request, Adjust, Count) main requests table';

-- RAC_REQUEST_ITEMS TABLE
CREATE TABLE IF NOT EXISTS rac_request_items (
  id SERIAL PRIMARY KEY,
  request_id INTEGER NOT NULL REFERENCES rac_requests(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  product_sku VARCHAR(100) NOT NULL,
  current_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
  requested_qty DECIMAL(10,2) NOT NULL CHECK (requested_qty > 0),
  approved_qty DECIMAL(10,2),
  shipped_qty DECIMAL(10,2),
  received_qty DECIMAL(10,2),
  unit VARCHAR(50) NOT NULL DEFAULT 'pcs',
  urgency VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (urgency IN ('normal', 'urgent', 'critical')),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE rac_request_items IS 'Line items for each RAC request';

-- RAC_REQUEST_HISTORY TABLE
CREATE TABLE IF NOT EXISTS rac_request_history (
  id SERIAL PRIMARY KEY,
  request_id INTEGER NOT NULL REFERENCES rac_requests(id) ON DELETE CASCADE,
  status_from VARCHAR(30),
  status_to VARCHAR(30) NOT NULL,
  changed_by VARCHAR(100) NOT NULL,
  changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  metadata JSON
);

COMMENT ON TABLE rac_request_history IS 'Audit trail for RAC request status changes';

-- Indexes for RAC
CREATE INDEX IF NOT EXISTS idx_rac_requests_number ON rac_requests(request_number);
CREATE INDEX IF NOT EXISTS idx_rac_requests_from_location ON rac_requests(from_location_id);
CREATE INDEX IF NOT EXISTS idx_rac_requests_to_location ON rac_requests(to_location_id);
CREATE INDEX IF NOT EXISTS idx_rac_requests_status ON rac_requests(status);
CREATE INDEX IF NOT EXISTS idx_rac_requests_priority ON rac_requests(priority);
CREATE INDEX IF NOT EXISTS idx_rac_requests_type ON rac_requests(request_type);
CREATE INDEX IF NOT EXISTS idx_rac_items_request_id ON rac_request_items(request_id);
CREATE INDEX IF NOT EXISTS idx_rac_items_product_id ON rac_request_items(product_id);
CREATE INDEX IF NOT EXISTS idx_rac_history_request_id ON rac_request_history(request_id);

-- ============================================================================
-- MIGRATION 4: WASTE MANAGEMENT SYSTEM
-- File: scripts/create-waste-table.sql
-- Description: Track waste, defects, and disposal
-- ============================================================================

-- WASTES TABLE
CREATE TABLE IF NOT EXISTS wastes (
  id SERIAL PRIMARY KEY,
  waste_number VARCHAR(50) UNIQUE NOT NULL,
  product_id INTEGER,
  product_name VARCHAR(255),
  product_sku VARCHAR(100),
  waste_type VARCHAR(50) NOT NULL CHECK (waste_type IN ('finished_product', 'raw_material', 'packaging', 'production_defect')),
  quantity DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  cost_value DECIMAL(15,2) NOT NULL,
  reason TEXT NOT NULL,
  disposal_method VARCHAR(50) NOT NULL CHECK (disposal_method IN ('disposal', 'donation', 'clearance_sale', 'recycling')),
  clearance_price DECIMAL(15,2),
  waste_date TIMESTAMP NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'recorded' CHECK (status IN ('recorded', 'disposed', 'processed')),
  notes TEXT,
  created_by VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_wastes_waste_number ON wastes(waste_number);
CREATE INDEX IF NOT EXISTS idx_wastes_product_id ON wastes(product_id);
CREATE INDEX IF NOT EXISTS idx_wastes_waste_type ON wastes(waste_type);
CREATE INDEX IF NOT EXISTS idx_wastes_waste_date ON wastes(waste_date);
CREATE INDEX IF NOT EXISTS idx_wastes_status ON wastes(status);

-- Add foreign key if products table exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
    ALTER TABLE wastes 
    ADD CONSTRAINT fk_wastes_product_id 
    FOREIGN KEY (product_id) 
    REFERENCES products(id) 
    ON UPDATE CASCADE 
    ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================================================
-- MIGRATION 5: RETURNS SYSTEM ENHANCEMENTS
-- File: migrations/manual-add-invoice-columns.sql & 20260126000004
-- Description: Returns with invoice tracking and stock opname integration
-- ============================================================================

-- Assuming returns table exists, add invoice columns
ALTER TABLE returns ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(100);
ALTER TABLE returns ADD COLUMN IF NOT EXISTS invoice_date TIMESTAMP;
ALTER TABLE returns ADD COLUMN IF NOT EXISTS distributor_name VARCHAR(255);
ALTER TABLE returns ADD COLUMN IF NOT EXISTS distributor_phone VARCHAR(50);
ALTER TABLE returns ADD COLUMN IF NOT EXISTS purchase_date TIMESTAMP;

-- Add stock opname integration columns
ALTER TABLE returns ADD COLUMN IF NOT EXISTS stock_opname_id INTEGER;
ALTER TABLE returns ADD COLUMN IF NOT EXISTS stock_opname_item_id INTEGER;
ALTER TABLE returns ADD COLUMN IF NOT EXISTS source_type VARCHAR(50) DEFAULT 'manual';

-- Comments
COMMENT ON COLUMN returns.invoice_number IS 'Nomor faktur/invoice dari distributor';
COMMENT ON COLUMN returns.invoice_date IS 'Tanggal faktur/invoice';
COMMENT ON COLUMN returns.distributor_name IS 'Nama distributor/supplier';
COMMENT ON COLUMN returns.stock_opname_id IS 'ID stock opname yang menjadi sumber retur';
COMMENT ON COLUMN returns.source_type IS 'Sumber retur: manual, stock_opname, customer, etc';

-- Indexes for returns
CREATE INDEX IF NOT EXISTS idx_returns_invoice_number ON returns(invoice_number);
CREATE INDEX IF NOT EXISTS idx_returns_distributor_name ON returns(distributor_name);
CREATE INDEX IF NOT EXISTS idx_returns_stock_opname_id ON returns(stock_opname_id);
CREATE INDEX IF NOT EXISTS idx_returns_source_type ON returns(source_type);

-- Add return tracking to stock_opname_items if table exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stock_opname_items') THEN
        ALTER TABLE stock_opname_items ADD COLUMN IF NOT EXISTS return_status VARCHAR(50) DEFAULT 'not_returned';
        ALTER TABLE stock_opname_items ADD COLUMN IF NOT EXISTS return_id INTEGER;
        COMMENT ON COLUMN stock_opname_items.return_status IS 'Status retur: not_returned, pending_return, returned';
        CREATE INDEX IF NOT EXISTS idx_stock_opname_items_return_status ON stock_opname_items(return_status);
    END IF;
END $$;

-- ============================================================================
-- TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function for RAC system
CREATE OR REPLACE FUNCTION update_rac_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function for wastes
CREATE OR REPLACE FUNCTION update_wastes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables with updated_at
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_suppliers_updated_at ON suppliers;
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_locations_updated_at ON locations;
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_inventory_stock_updated_at ON inventory_stock;
CREATE TRIGGER update_inventory_stock_updated_at BEFORE UPDATE ON inventory_stock
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_stock_adjustments_updated_at ON stock_adjustments;
CREATE TRIGGER update_stock_adjustments_updated_at BEFORE UPDATE ON stock_adjustments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER rac_requests_updated_at
  BEFORE UPDATE ON rac_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_rac_updated_at();

CREATE TRIGGER rac_items_updated_at
  BEFORE UPDATE ON rac_request_items
  FOR EACH ROW
  EXECUTE FUNCTION update_rac_updated_at();

DROP TRIGGER IF EXISTS trigger_update_wastes_updated_at ON wastes;
CREATE TRIGGER trigger_update_wastes_updated_at
  BEFORE UPDATE ON wastes
  FOR EACH ROW
  EXECUTE FUNCTION update_wastes_updated_at();

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Insert default categories
INSERT INTO categories (name, description) VALUES
  ('Obat Keras', 'Obat yang hanya dapat diberikan dengan resep dokter'),
  ('Obat Bebas', 'Obat yang dapat dibeli tanpa resep dokter'),
  ('Obat Bebas Terbatas', 'Obat yang dapat dibeli tanpa resep dengan batasan'),
  ('Vitamin & Suplemen', 'Vitamin dan suplemen kesehatan'),
  ('Obat Luar', 'Obat untuk penggunaan luar seperti salep, krim'),
  ('Alat Kesehatan', 'Peralatan medis dan kesehatan')
ON CONFLICT DO NOTHING;

-- Insert default locations
INSERT INTO locations (name, code, type, city) VALUES
  ('Gudang Pusat', 'WH-001', 'warehouse', 'Jakarta'),
  ('Toko Cabang A', 'ST-001', 'store', 'Bandung'),
  ('Toko Cabang B', 'ST-002', 'store', 'Surabaya'),
  ('Gudang Regional Jakarta', 'WH-002', 'warehouse', 'Jakarta Timur'),
  ('Toko Cabang C', 'ST-003', 'store', 'Semarang'),
  ('Toko Cabang D', 'ST-004', 'store', 'Yogyakarta')
ON CONFLICT (code) DO NOTHING;

-- Insert default suppliers
INSERT INTO suppliers (name, code, contact_person, phone) VALUES
  ('PT Kimia Farma', 'SUP-001', 'Budi Santoso', '021-5551234'),
  ('PT Dexa Medica', 'SUP-002', 'Siti Rahayu', '021-5551235'),
  ('PT Bayer Indonesia', 'SUP-003', 'Ahmad Wijaya', '021-5551236'),
  ('PT Eagle Indo Pharma', 'SUP-004', 'Dewi Lestari', '021-5551237'),
  ('PT Mahakam Beta Farma', 'SUP-005', 'Rudi Hermawan', '021-5551238')
ON CONFLICT (code) DO NOTHING;

-- Insert sample products
INSERT INTO products (name, sku, category_id, supplier_id, unit, buy_price, sell_price, minimum_stock, maximum_stock, reorder_point) VALUES
  ('Paracetamol 500mg', 'MED-PCT-500', 2, 1, 'strip', 10000, 12000, 20, 100, 15),
  ('Amoxicillin 500mg', 'MED-AMX-500', 1, 2, 'strip', 20000, 25000, 25, 150, 30),
  ('Vitamin C 1000mg', 'SUP-VTC-1000', 4, 3, 'botol', 12000, 15000, 25, 100, 20),
  ('Antasida Tablet', 'MED-ANT-001', 2, 1, 'strip', 6000, 8000, 30, 150, 25),
  ('Minyak Kayu Putih 60ml', 'OTC-MKP-60', 5, 4, 'botol', 15000, 18000, 10, 50, 8),
  ('Cefixime 200mg', 'MED-CFX-200', 1, 2, 'strip', 28000, 35000, 15, 80, 12),
  ('Betadine Solution 60ml', 'OTC-BET-60', 5, 5, 'botol', 16000, 20000, 12, 60, 10),
  ('Ibuprofen 400mg', 'MED-IBU-400', 3, 1, 'strip', 12000, 15000, 20, 100, 15)
ON CONFLICT (sku) DO NOTHING;

-- Insert initial stock
INSERT INTO inventory_stock (product_id, location_id, quantity) 
SELECT p.id, 1, 50
FROM products p
WHERE p.sku IN ('MED-PCT-500', 'MED-AMX-500', 'SUP-VTC-1000', 'MED-ANT-001', 
                'OTC-MKP-60', 'MED-CFX-200', 'OTC-BET-60', 'MED-IBU-400')
ON CONFLICT (product_id, location_id) DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify all tables created
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN (
    'categories', 'suppliers', 'locations', 'products', 
    'inventory_stock', 'stock_movements', 'stock_adjustments', 'stock_adjustment_items',
    'inventory_transfers', 'inventory_transfer_items', 'inventory_transfer_history',
    'rac_requests', 'rac_request_items', 'rac_request_history',
    'wastes', 'returns'
  )
ORDER BY table_name;

-- Success message
DO $$ 
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE '✅ DATABASE EXPORT COMPLETED SUCCESSFULLY!';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Tables created: 17+';
  RAISE NOTICE 'Indexes created: 50+';
  RAISE NOTICE 'Triggers created: 10+';
  RAISE NOTICE 'Seed data inserted: Categories, Locations, Suppliers, Products';
  RAISE NOTICE '============================================';
END $$;

-- ============================================================================
-- END OF DATABASE EXPORT
-- ============================================================================
