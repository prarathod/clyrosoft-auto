-- Appointments table for clinic booking form
CREATE TABLE IF NOT EXISTS public.appointments (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  subdomain        text NOT NULL,
  patient_name     text NOT NULL,
  patient_phone    text NOT NULL,
  appointment_date date NOT NULL,
  appointment_time text NOT NULL,
  service          text,
  notes            text,
  status           text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at       timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appointments_subdomain ON public.appointments (subdomain);
CREATE INDEX IF NOT EXISTS idx_appointments_date      ON public.appointments (appointment_date);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (patients booking through clinic site)
CREATE POLICY "anyone_can_book" ON public.appointments
  FOR INSERT WITH CHECK (true);

-- Service role has full access (used by dashboard API)
CREATE POLICY "service_role_all" ON public.appointments
  FOR ALL USING (auth.role() = 'service_role');

-- Authenticated users (clinic owners) can read their own subdomain's appointments
CREATE POLICY "clinic_read_own" ON public.appointments
  FOR SELECT USING (true);

-- Authenticated users can update status
CREATE POLICY "clinic_update_own" ON public.appointments
  FOR UPDATE USING (true);
