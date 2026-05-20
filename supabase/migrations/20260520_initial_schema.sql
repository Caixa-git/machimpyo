-- 클리어미 MVP 초기 스키마

-- 대기자 명단
create table waitlist (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  created_at timestamptz default now()
);

-- 사용자
create table users (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  name text,
  phone text,
  address text,
  plan text default 'free' check (plan in ('free', 'starter', 'pro')),
  created_at timestamptz default now()
);

-- 브로커 목록
create table brokers (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  url text,
  removal_url text,
  method text check (method in ('form', 'email', 'manual')),
  avg_days int default 14,
  priority int default 2 check (priority between 1 and 3),
  active boolean default true
);

-- 스캔 결과
create table scans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade,
  scanned_at timestamptz default now(),
  total_found int default 0,
  status text default 'pending' check (status in ('pending', 'processing', 'complete'))
);

-- 발견된 항목
create table exposures (
  id uuid default gen_random_uuid() primary key,
  scan_id uuid references scans(id) on delete cascade,
  broker_id uuid references brokers(id),
  broker_name text not null,
  url text,
  data_found jsonb,
  status text default 'found' check (status in ('found', 'removal_requested', 'removed')),
  removal_requested_at timestamptz,
  removed_at timestamptz
);

-- RLS (Row Level Security)
alter table users enable row level security;
alter table scans enable row level security;
alter table exposures enable row level security;

create policy "Users can read own data" on users for select using (auth.uid() = id);
create policy "Users can read own scans" on scans for select using (auth.uid() = user_id);
create policy "Users can read own exposures" on exposures for select using (
  scan_id in (select id from scans where user_id = auth.uid())
);
