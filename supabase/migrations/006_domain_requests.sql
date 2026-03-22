-- Domain requests from clients
CREATE TABLE IF NOT EXISTS domain_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  clinic_subdomain text NOT NULL,
  clinic_email text NOT NULL,
  payment_id text NOT NULL,
  type text NOT NULL CHECK (type IN ('own', 'buy')),
  domain text NOT NULL,
  tld text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'configured', 'failed'))
);

-- custom_domain column on clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS custom_domain text;
