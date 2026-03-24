-- Custom domain fields on clients
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS custom_domain        text    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS custom_domain_status text    DEFAULT 'pending';

-- Index for fast custom-domain lookups in middleware
CREATE INDEX IF NOT EXISTS idx_clients_custom_domain ON clients (custom_domain)
  WHERE custom_domain IS NOT NULL;
