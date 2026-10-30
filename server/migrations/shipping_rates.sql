-- Shipping Rates Table and State-wise Shipping Migration for Padmanabha Fabrics
-- Compatible with MySQL 8.0+ and TiDB Cloud

CREATE TABLE IF NOT EXISTS shipping_rates (
  id VARCHAR(50) PRIMARY KEY,
  state VARCHAR(100) UNIQUE NOT NULL,
  charge DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_shipping_state (state),
  INDEX idx_shipping_active (is_active)
);

-- Add state and shipping charge columns to orders table if not present
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_state VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_charge DECIMAL(10,2) DEFAULT 0.00;

-- Pre-fill Indian States and Union Territories with default shipping charge of 0
INSERT IGNORE INTO shipping_rates (id, state, charge, is_active) VALUES
  ('rate-andhra-pradesh', 'Andhra Pradesh', 0.00, 1),
  ('rate-arunachal-pradesh', 'Arunachal Pradesh', 0.00, 1),
  ('rate-assam', 'Assam', 0.00, 1),
  ('rate-bihar', 'Bihar', 0.00, 1),
  ('rate-chhattisgarh', 'Chhattisgarh', 0.00, 1),
  ('rate-goa', 'Goa', 0.00, 1),
  ('rate-gujarat', 'Gujarat', 0.00, 1),
  ('rate-haryana', 'Haryana', 0.00, 1),
  ('rate-himachal-pradesh', 'Himachal Pradesh', 0.00, 1),
  ('rate-jharkhand', 'Jharkhand', 0.00, 1),
  ('rate-karnataka', 'Karnataka', 0.00, 1),
  ('rate-kerala', 'Kerala', 0.00, 1),
  ('rate-madhya-pradesh', 'Madhya Pradesh', 0.00, 1),
  ('rate-maharashtra', 'Maharashtra', 0.00, 1),
  ('rate-manipur', 'Manipur', 0.00, 1),
  ('rate-meghalaya', 'Meghalaya', 0.00, 1),
  ('rate-mizoram', 'Mizoram', 0.00, 1),
  ('rate-nagaland', 'Nagaland', 0.00, 1),
  ('rate-odisha', 'Odisha', 0.00, 1),
  ('rate-punjab', 'Punjab', 0.00, 1),
  ('rate-rajasthan', 'Rajasthan', 0.00, 1),
  ('rate-sikkim', 'Sikkim', 0.00, 1),
  ('rate-tamil-nadu', 'Tamil Nadu', 0.00, 1),
  ('rate-telangana', 'Telangana', 0.00, 1),
  ('rate-tripura', 'Tripura', 0.00, 1),
  ('rate-uttar-pradesh', 'Uttar Pradesh', 0.00, 1),
  ('rate-uttarakhand', 'Uttarakhand', 0.00, 1),
  ('rate-west-bengal', 'West Bengal', 0.00, 1),
  ('rate-andaman-and-nicobar-islands', 'Andaman and Nicobar Islands', 0.00, 1),
  ('rate-chandigarh', 'Chandigarh', 0.00, 1),
  ('rate-dadra-and-nagar-haveli-and-daman-and-diu', 'Dadra and Nagar Haveli and Daman and Diu', 0.00, 1),
  ('rate-delhi', 'Delhi', 0.00, 1),
  ('rate-jammu-and-kashmir', 'Jammu and Kashmir', 0.00, 1),
  ('rate-ladakh', 'Ladakh', 0.00, 1),
  ('rate-lakshadweep', 'Lakshadweep', 0.00, 1),
  ('rate-puducherry', 'Puducherry', 0.00, 1);
