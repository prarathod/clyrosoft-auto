-- Rich fields scraped from Google Maps to make demo templates look real
ALTER TABLE clients ADD COLUMN IF NOT EXISTS tagline       text;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS doctor_bio    text;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS services      jsonb DEFAULT '[]';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS testimonials  jsonb DEFAULT '[]';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS google_maps_link text;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS theme         text DEFAULT 'classic';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS photos        text[] DEFAULT '{}';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS doctors       jsonb DEFAULT '[]';

-- New rich fields
ALTER TABLE clients ADD COLUMN IF NOT EXISTS full_address   text;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS opening_hours  jsonb DEFAULT '[]';

-- Add columns to leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS area  text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email text;
