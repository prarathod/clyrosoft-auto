-- Allow public (anon) read access to clients so the template app can
-- render clinic websites without a service-role key.
-- Clinic website data is intentionally public (patients need to view it).
create policy "public_read" on public.clients
  for select using (true);
