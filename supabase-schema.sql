-- Ejecuta esto en Supabase: Dashboard > SQL Editor > New query > Run

create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  password_hash text not null,
  created_at timestamptz default now()
);

create table if not exists routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  exercises jsonb not null default '[]',
  created_at timestamptz default now()
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  date date not null,
  routine_id uuid references routines(id) on delete set null,
  routine_name text,
  exercises jsonb not null default '[]',
  created_at timestamptz default now()
);

create table if not exists measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  date date not null,
  weight numeric,
  neck numeric,
  chest numeric,
  waist numeric,
  hips numeric,
  arm numeric,
  thigh numeric,
  notes text,
  created_at timestamptz default now()
);

create index if not exists idx_routines_user on routines(user_id);
create index if not exists idx_sessions_user on sessions(user_id);
create index if not exists idx_sessions_date on sessions(date);
create index if not exists idx_measurements_user on measurements(user_id);
create index if not exists idx_measurements_date on measurements(date);

-- Nota: el acceso a estas tablas ocurre exclusivamente desde las rutas API
-- del servidor usando la service role key, así que Row Level Security
-- no es necesaria para el funcionamiento de la app. Si en algún momento
-- expones estas tablas directamente al cliente, habilita RLS antes.
