-- Store signup password so admin/sales can see login credentials
ALTER TABLE leads ADD COLUMN IF NOT EXISTS login_password text;
