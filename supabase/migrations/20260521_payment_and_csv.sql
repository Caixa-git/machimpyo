-- 마침표 결제 주문 테이블 (Toss Payments)
-- 결제 생성부터 완료/실패까지 추적

create table payment_orders (
  id uuid default gen_random_uuid() primary key,
  order_id text unique not null,
  user_id uuid references legacy_users(id) on delete cascade,
  plan_id text not null check (plan_id in ('basic', 'pro', 'family')),
  amount integer not null,
  status text default 'pending' check (status in ('pending', 'completed', 'failed', 'cancelled')),
  payment_key text,
  paid_at timestamptz,
  toss_response jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- CSV 업로드 이력
create table csv_uploads (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references legacy_users(id) on delete cascade,
  file_name text not null,
  total_found integer default 0,
  total_saved integer default 0,
  duplicates_skipped integer default 0,
  created_at timestamptz default now()
);

-- 인덱스
create index idx_payment_orders_user on payment_orders(user_id);
create index idx_payment_orders_order on payment_orders(order_id);
create index idx_csv_uploads_user on csv_uploads(user_id);

-- RLS
alter table payment_orders enable row level security;
alter table csv_uploads enable row level security;

create policy "Users can read own payment orders" on payment_orders
  for select using (auth.uid() = user_id);

create policy "Users can read own csv uploads" on csv_uploads
  for select using (auth.uid() = user_id);
