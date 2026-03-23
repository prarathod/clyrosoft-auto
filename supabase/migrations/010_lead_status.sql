-- Add lead_status for sales tracking
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_status text DEFAULT 'new';
-- Values: new | interested | not_interested | callback | paid
