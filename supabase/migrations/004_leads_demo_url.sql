-- Add demo_url to leads so WA message can send the actual demo link
ALTER TABLE leads ADD COLUMN IF NOT EXISTS demo_url text;
