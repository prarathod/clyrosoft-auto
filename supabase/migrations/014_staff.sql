-- ── Staff master ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS staff (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  subdomain  text        NOT NULL,
  name       text        NOT NULL,
  role       text        NOT NULL DEFAULT 'other',
  phone      text,
  email      text,
  salary     numeric(10,2) DEFAULT 0,
  join_date  date,
  status     text        NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  notes      text,
  created_at timestamptz DEFAULT now()
);

-- ── Daily attendance ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendance (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  subdomain  text NOT NULL,
  staff_id   uuid NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  date       date NOT NULL,
  status     text NOT NULL CHECK (status IN ('present','absent','half_day','leave')),
  note       text,
  created_at timestamptz DEFAULT now(),
  UNIQUE (staff_id, date)
);

-- ── Leave requests ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leaves (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  subdomain   text NOT NULL,
  staff_id    uuid NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  leave_type  text NOT NULL DEFAULT 'casual' CHECK (leave_type IN ('sick','casual','earned','unpaid')),
  start_date  date NOT NULL,
  end_date    date NOT NULL,
  days_count  int  NOT NULL DEFAULT 1,
  reason      text,
  status      text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at  timestamptz DEFAULT now()
);

-- ── Monthly payroll ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS salary_payments (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  subdomain   text NOT NULL,
  staff_id    uuid NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  month       int  NOT NULL CHECK (month BETWEEN 1 AND 12),
  year        int  NOT NULL,
  base_salary numeric(10,2) DEFAULT 0,
  bonus       numeric(10,2) DEFAULT 0,
  deductions  numeric(10,2) DEFAULT 0,
  status      text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid')),
  paid_date   date,
  notes       text,
  created_at  timestamptz DEFAULT now(),
  UNIQUE (staff_id, month, year)
);

-- ── Indexes ────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_staff_subdomain      ON staff(subdomain);
CREATE INDEX IF NOT EXISTS idx_attendance_subdomain ON attendance(subdomain);
CREATE INDEX IF NOT EXISTS idx_attendance_date      ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_leaves_subdomain     ON leaves(subdomain);
CREATE INDEX IF NOT EXISTS idx_salary_subdomain     ON salary_payments(subdomain);

-- ── RLS (open — same pattern as appointments) ──────────────────────────────────
ALTER TABLE staff            ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance       ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaves           ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_payments  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "all_staff"   ON staff            FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "all_att"     ON attendance       FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "all_leaves"  ON leaves           FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "all_salary"  ON salary_payments  FOR ALL USING (true) WITH CHECK (true);
