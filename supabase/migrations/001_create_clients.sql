-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Clients table
create table public.clients (
  id              uuid primary key default uuid_generate_v4(),
  profession_type text not null,
  clinic_name     text not null,
  doctor_name     text not null,
  phone           text not null unique,
  email           text,
  city            text not null,
  area            text not null,
  subdomain       text not null unique,
  status          text not null default 'demo' check (status in ('demo', 'paying', 'inactive')),
  payment_date    timestamptz,
  monthly_amount  integer not null default 999,
  created_at      timestamptz not null default now()
);

-- Index for fast subdomain lookups (hot path on every page load)
create index idx_clients_subdomain on public.clients (subdomain);
create index idx_clients_status    on public.clients (status);

-- Row Level Security
alter table public.clients enable row level security;

-- Allow service role full access (used server-side only)
create policy "service_role_all" on public.clients
  for all using (auth.role() = 'service_role');
