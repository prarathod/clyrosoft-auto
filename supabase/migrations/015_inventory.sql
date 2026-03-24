-- ── Inventory items catalog ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inventory_items (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  subdomain        text NOT NULL,
  name             text NOT NULL,
  category         text NOT NULL DEFAULT 'General',
  unit             text NOT NULL DEFAULT 'units',
  current_stock    numeric(10,2) DEFAULT 0,
  min_stock_alert  numeric(10,2) DEFAULT 5,
  cost_price       numeric(10,2) DEFAULT 0,
  sell_price       numeric(10,2) DEFAULT 0,
  supplier         text,
  expiry_date      date,
  created_at       timestamptz DEFAULT now()
);

-- ── Stock movements ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  subdomain  text NOT NULL,
  item_id    uuid NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  type       text NOT NULL CHECK (type IN ('in','out','adjustment')),
  quantity   numeric(10,2) NOT NULL,
  unit_price numeric(10,2) DEFAULT 0,
  reason     text,
  created_at timestamptz DEFAULT now()
);

-- ── Indexes ────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_inv_items_subdomain ON inventory_items(subdomain);
CREATE INDEX IF NOT EXISTS idx_inv_trans_subdomain ON inventory_transactions(subdomain);
CREATE INDEX IF NOT EXISTS idx_inv_trans_item      ON inventory_transactions(item_id);

-- ── RLS ────────────────────────────────────────────────────────────────────────
ALTER TABLE inventory_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "all_items" ON inventory_items        FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "all_trans" ON inventory_transactions FOR ALL USING (true) WITH CHECK (true);
