CREATE TABLE IF NOT EXISTS analytics (
  id          bigserial PRIMARY KEY,
  subdomain   text        NOT NULL,
  event_type  text        NOT NULL,  -- 'page_view' | 'whatsapp_click' | 'form_submit'
  page        text,                  -- path e.g. '/', '/about', '/contact'
  referrer    text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_subdomain ON analytics (subdomain);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics (created_at DESC);

-- Allow public inserts (tracking from clinic websites)
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_insert" ON analytics FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "owner_select"  ON analytics FOR SELECT TO authenticated USING (true);
