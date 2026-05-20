-- 마침표 DB 스키마
-- Phase 0 MVP: 가입 → 계정등록 → 위임장 → 사망감지 → 계정정리

-- 가입자
create table legacy_users (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  name text,
  phone text,
  plan text default 'basic' check (plan in ('basic', 'pro', 'family')),
  status text default 'active' check (status in ('active', 'deceased', 'completed')),
  subscription_started_at timestamptz default now(),
  created_at timestamptz default now()
);

-- 가입자별 등록 계정
create table accounts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references legacy_users(id) on delete cascade,
  service_name text not null,
  category text not null check (category in ('sns', 'messenger', 'portal', 'game', 'commerce', 'broker', 'subscription', 'adult', 'other')),
  login_id text,
  login_password text,
  status text default 'pending' check (status in ('pending', 'deleting', 'deleted', 'failed')),
  created_at timestamptz default now(),
  deleted_at timestamptz
);

-- 유족 연락처
create table guardians (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references legacy_users(id) on delete cascade,
  name text not null,
  relation text not null check (relation in ('spouse', 'child', 'parent', 'sibling', 'friend', 'other')),
  phone text,
  email text,
  priority int default 1 check (priority between 1 and 3),
  created_at timestamptz default now()
);

-- 법적 위임장
create table legal_waivers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references legacy_users(id) on delete cascade unique,
  stop_permission text not null check (stop_permission in ('forbidden', 'allowed', 'allowed_with_data')),
  mydata_consent boolean default true,
  signed_at timestamptz not null,
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- 사망 감지 로그
create table death_detections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references legacy_users(id) on delete cascade,
  method text not null check (method in ('gov_api', 'obituary', 'inactivity', 'guardian_report', 'funeral_partner')),
  detected_at timestamptz default now(),
  confirmed_at timestamptz,
  status text default 'pending' check (status in ('pending', 'confirmed', 'false_alarm'))
);

-- 삭제 요청
create table deletion_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references legacy_users(id) on delete cascade,
  triggered_by uuid references death_detections(id),
  started_at timestamptz default now(),
  completed_at timestamptz,
  status text default 'pending' check (status in ('pending', 'processing', 'completed', 'partial', 'failed')),
  total_accounts int default 0,
  deleted_accounts int default 0,
  failed_accounts int default 0
);

-- 삭제 실행 로그
create table deletion_logs (
  id uuid default gen_random_uuid() primary key,
  request_id uuid references deletion_requests(id) on delete cascade,
  account_id uuid references accounts(id),
  method text check (method in ('auto_playwright', 'auto_api', 'manual')),
  status text check (status in ('success', 'failed', 'skipped_legal')),
  error_message text,
  screenshot_url text,
  executed_at timestamptz default now()
);

-- 유족 통지 로그
create table notification_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references legacy_users(id) on delete cascade,
  channel text check (channel in ('sms', 'email', 'mail_post')),
  sent_at timestamptz default now(),
  status text default 'sent'
);

-- RLS
alter table legacy_users enable row level security;
alter table accounts enable row level security;
alter table guardians enable row level security;
alter table legal_waivers enable row level security;
alter table death_detections enable row level security;
alter table deletion_requests enable row level security;
alter table deletion_logs enable row level security;
alter table notification_logs enable row level security;

create policy "Users can read own data" on legacy_users for select using (auth.uid() = id);
create policy "Users can read own accounts" on accounts for select using (auth.uid() = user_id);
create policy "Users can read own guardians" on guardians for select using (auth.uid() = user_id);
