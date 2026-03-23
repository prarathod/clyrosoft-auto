-- ─── Sales employees ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sales_employees (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                      text NOT NULL,
  email                     text NOT NULL UNIQUE,
  password_hash             text NOT NULL,          -- sha256(password) hex
  commission_per_contact    numeric DEFAULT 10,     -- ₹ per lead contacted
  commission_per_conversion numeric DEFAULT 200,    -- ₹ per lead that paid
  is_active                 boolean DEFAULT true,
  created_at                timestamptz DEFAULT now()
);

-- ─── Lead activity log ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lead_activities (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id        uuid REFERENCES leads(id) ON DELETE CASCADE,
  employee_email text NOT NULL,
  employee_name  text NOT NULL,
  activity_type  text NOT NULL CHECK (activity_type IN ('call','whatsapp','note','demo_created')),
  note           text,
  created_at     timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lead_activities_lead     ON lead_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_employee ON lead_activities(employee_email);
CREATE INDEX IF NOT EXISTS idx_lead_activities_date     ON lead_activities(created_at);

-- ─── RLS: service role only ───────────────────────────────────────────────────
ALTER TABLE sales_employees  ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_only_sales_employees" ON sales_employees  USING (false);
CREATE POLICY "service_only_lead_activities" ON lead_activities  USING (false);

-- ─── Seed: Rahul ──────────────────────────────────────────────────────────────
-- password_hash = sha256('Rahul@123')
-- computed: echo -n 'Rahul@123' | sha256sum  →  see below
INSERT INTO sales_employees (name, email, password_hash, commission_per_contact, commission_per_conversion)
VALUES (
  'Rahul',
  'rahul@gmail.com',
  '76b5573f4fa5e70ce8bc70f4af6671e8da3af3e802e83e0a9183c70b3abb007d',  -- sha256('Rahul@123')
  10,
  200
)
ON CONFLICT (email) DO NOTHING;
