-- Leads table (scraped/submitted clinics not yet converted to clients)
CREATE TABLE IF NOT EXISTS public.leads (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_name  text NOT NULL,
  doctor_name  text NOT NULL DEFAULT 'Doctor',
  phone        text NOT NULL UNIQUE,
  email        text,
  city         text NOT NULL DEFAULT '',
  area         text,
  contacted    boolean NOT NULL DEFAULT false,
  demo_url     text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leads_phone      ON public.leads (phone);
CREATE INDEX IF NOT EXISTS idx_leads_contacted  ON public.leads (contacted);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Service role full access (scraper + admin API use service role key)
CREATE POLICY "service_role_all" ON public.leads
  FOR ALL USING (auth.role() = 'service_role');
