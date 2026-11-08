-- Run once in Supabase: Dashboard -> SQL Editor -> paste -> Run.
-- One table per collection; each row keeps the whole document in `data` (same shape as the local data/db.json).

create table if not exists public.users    (id text primary key, data jsonb not null, created_at timestamptz not null default now());
create table if not exists public.orders   (id text primary key, data jsonb not null, created_at timestamptz not null default now());
create table if not exists public.projects (id text primary key, data jsonb not null, created_at timestamptz not null default now());
create table if not exists public.uploads  (id text primary key, data jsonb not null, created_at timestamptz not null default now());
create table if not exists public.exports  (id text primary key, data jsonb not null, created_at timestamptz not null default now());

create unique index if not exists users_email on public.users ((data->>'email'));
create index if not exists orders_user on public.orders ((data->>'userId'));

-- Only the API (service_role key, server side) touches these tables.
-- RLS on with no policies = the public anon key can read/write nothing.
alter table public.users    enable row level security;
alter table public.orders   enable row level security;
alter table public.projects enable row level security;
alter table public.uploads  enable row level security;
alter table public.exports  enable row level security;

-- Private bucket for DWG drawings, 80MB per file (= MAX_UPLOAD_MB).
-- Note: the Supabase FREE plan caps every upload at 50MB whatever this says; Pro lifts it (Storage -> Settings).
insert into storage.buckets (id, name, public, file_size_limit)
values ('drawings', 'drawings', false, 83886080)
on conflict (id) do update set file_size_limit = excluded.file_size_limit;
