-- ===================================================================
-- Padmanabha Fabrics: Orders Invoice Number & Invoice Date Migration
-- ===================================================================

ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(100) NULL AFTER order_number,
  ADD COLUMN IF NOT EXISTS invoice_date VARCHAR(50) NULL AFTER invoice_number;

-- Add index on invoice_number for instant lookups
CREATE INDEX idx_orders_invoice_number ON orders (invoice_number);

