-- Patients + visit history + follow-up reminders
CREATE TABLE IF NOT EXISTS patients (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subdomain       text NOT NULL,
  name            text NOT NULL,
  phone           text,
  email           text,
  date_of_birth   date,
  gender          text CHECK (gender IN ('male','female','other')),
  blood_group     text,
  address         text,
  emergency_contact_name  text,
  emergency_contact_phone text,
  allergies       text[],
  chronic_conditions text[],
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patients_subdomain ON patients (subdomain);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients (phone);

-- Visit / Consultation records
CREATE TABLE IF NOT EXISTS patient_visits (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subdomain       text NOT NULL,
  patient_id      uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  visit_date      date NOT NULL DEFAULT CURRENT_DATE,
  visit_type      text NOT NULL DEFAULT 'opd' CHECK (visit_type IN ('opd','ipd','follow_up','emergency','teleconsult')),
  chief_complaint text,
  diagnosis       text,
  prescription    text,             -- free-text or structured JSON
  vitals          jsonb,            -- { bp, pulse, temp, spo2, weight, height }
  doctor_name     text,
  staff_name      text,
  fees_charged    numeric(10,2) DEFAULT 0,
  payment_status  text DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','waived')),
  notes           text,
  attachments     text[],           -- Cloudinary URLs for reports/X-rays
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_visits_subdomain ON patient_visits (subdomain);
CREATE INDEX IF NOT EXISTS idx_visits_patient ON patient_visits (patient_id);
CREATE INDEX IF NOT EXISTS idx_visits_date ON patient_visits (visit_date DESC);

-- Follow-up reminders
CREATE TABLE IF NOT EXISTS patient_followups (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subdomain       text NOT NULL,
  patient_id      uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  visit_id        uuid REFERENCES patient_visits(id) ON DELETE SET NULL,
  followup_date   date NOT NULL,
  reason          text,
  status          text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','completed','cancelled','missed')),
  reminder_sent   boolean DEFAULT false,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_followups_subdomain ON patient_followups (subdomain);
CREATE INDEX IF NOT EXISTS idx_followups_date ON patient_followups (followup_date);
CREATE INDEX IF NOT EXISTS idx_followups_patient ON patient_followups (patient_id);

-- Inventory usage linked to patient visits
ALTER TABLE inventory_transactions
  ADD COLUMN IF NOT EXISTS patient_id uuid REFERENCES patients(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS visit_id   uuid REFERENCES patient_visits(id) ON DELETE SET NULL;

-- RLS: open for now (clinic is single-tenant per subdomain)
ALTER TABLE patients           ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_visits     ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_followups  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "patients_all"   ON patients           FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "visits_all"     ON patient_visits     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "followups_all"  ON patient_followups  FOR ALL USING (true) WITH CHECK (true);
