-- Run once on the Neon database: Vercel -> Storage -> your database -> "Open in Neon" -> SQL Editor -> paste -> Run.
-- One table per collection; each row keeps the whole document in `data` (same shape as the local data/db.json).
-- Only the API connects (DATABASE_URL stays server side), so no row-level security is needed.

create table if not exists users    (id text primary key, data jsonb not null, created_at timestamptz not null default now());
create table if not exists orders   (id text primary key, data jsonb not null, created_at timestamptz not null default now());
create table if not exists projects (id text primary key, data jsonb not null, created_at timestamptz not null default now());
create table if not exists uploads  (id text primary key, data jsonb not null, created_at timestamptz not null default now());
create table if not exists exports  (id text primary key, data jsonb not null, created_at timestamptz not null default now());

-- one account per email; lookups use `data @> {...}` so GIN indexes cover them
create unique index if not exists users_email on users ((data->>'email'));
create index if not exists users_data on users using gin (data jsonb_path_ops);
create index if not exists orders_data on orders using gin (data jsonb_path_ops);
