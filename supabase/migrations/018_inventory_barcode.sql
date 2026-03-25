-- Add barcode/QR support to inventory items
ALTER TABLE inventory_items
  ADD COLUMN IF NOT EXISTS barcode       text,           -- scanned barcode / QR code value
  ADD COLUMN IF NOT EXISTS staff_name    text;           -- last updated by (for mobile app tracking)

ALTER TABLE inventory_transactions
  ADD COLUMN IF NOT EXISTS staff_name    text;           -- who recorded this movement

CREATE INDEX IF NOT EXISTS idx_inventory_barcode ON inventory_items (barcode) WHERE barcode IS NOT NULL;
