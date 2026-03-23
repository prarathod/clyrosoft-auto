-- Extended website customization fields
ALTER TABLE clients ADD COLUMN IF NOT EXISTS stats          jsonb    DEFAULT NULL;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS opening_hours  jsonb    DEFAULT NULL;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS social_links   jsonb    DEFAULT NULL;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS announcement   text     DEFAULT NULL;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS hidden_sections text[]  DEFAULT NULL;

-- Add login_password to leads (stores password set at signup for email sending)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS login_password text DEFAULT NULL;
