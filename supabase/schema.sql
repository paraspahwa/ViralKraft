create extension if not exists "pgcrypto";

create table if not exists public.plans (
  plan_id text primary key,
  name text not null,
  description text,
  monthly_inr integer not null,
  yearly_inr integer not null,
  monthly_usd numeric(10,2) not null,
  yearly_usd numeric(10,2) not null,
  features jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

do $$
begin
  alter table public.plans alter column monthly_usd type numeric(10,2);
  alter table public.plans alter column yearly_usd type numeric(10,2);
exception
  when undefined_table then null;
end $$;

create table if not exists public.payment_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  plan_id text not null references public.plans(plan_id),
  billing_cycle text not null check (billing_cycle in ('monthly', 'yearly')),
  currency text not null,
  amount_minor integer not null,
  status text not null default 'created',
  razorpay_order_id text unique,
  razorpay_payment_id text,
  receipt text unique,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  plan_id text not null references public.plans(plan_id),
  billing_cycle text not null check (billing_cycle in ('monthly', 'yearly')),
  status text not null check (status in ('active', 'past_due', 'cancelled', 'trialing')),
  current_period_start timestamptz not null,
  current_period_end timestamptz not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.credit_wallets (
  user_id uuid primary key,
  balance numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  transaction_type text not null check (transaction_type in ('credit_purchase', 'video_generation_debit', 'refund', 'adjustment')),
  amount numeric(12,2) not null,
  balance_after numeric(12,2) not null,
  reference_type text,
  reference_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists credit_transactions_user_created_idx
  on public.credit_transactions (user_id, created_at desc);

create unique index if not exists credit_transactions_order_purchase_unique_idx
  on public.credit_transactions (transaction_type, reference_type, reference_id)
  where transaction_type = 'credit_purchase' and reference_type = 'order';

create unique index if not exists credit_transactions_generation_refund_unique_idx
  on public.credit_transactions (transaction_type, reference_type, reference_id)
  where transaction_type = 'refund' and reference_type = 'generation';

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  niche text not null,
  status text not null check (status in ('published', 'rendering')),
  platform text,
  views_count integer,
  watch_time_pct integer,
  thumb_color text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists videos_user_created_idx
  on public.videos (user_id, created_at desc);

create table if not exists public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  topic text not null,
  message text not null,
  source text,
  metadata jsonb not null default '{}'::jsonb,
  status text not null default 'new' check (status in ('new', 'reviewed', 'resolved', 'spam')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contact_inquiries_status_created_idx
  on public.contact_inquiries (status, created_at desc);

alter table public.videos enable row level security;

drop policy if exists "videos_select_own" on public.videos;
create policy "videos_select_own"
  on public.videos
  for select
  using (auth.uid() = user_id);

drop policy if exists "videos_insert_own" on public.videos;
create policy "videos_insert_own"
  on public.videos
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "videos_update_own" on public.videos;
create policy "videos_update_own"
  on public.videos
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "videos_delete_own" on public.videos;
create policy "videos_delete_own"
  on public.videos
  for delete
  using (auth.uid() = user_id);

do $$
begin
  alter publication supabase_realtime add table public.videos;
exception
  when duplicate_object then null;
end $$;

insert into storage.buckets (id, name, public)
values ('user-audio', 'user-audio', false)
on conflict (id) do nothing;

drop policy if exists "user_audio_select_own" on storage.objects;
create policy "user_audio_select_own"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'user-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "user_audio_insert_own" on storage.objects;
create policy "user_audio_insert_own"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'user-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "user_audio_update_own" on storage.objects;
create policy "user_audio_update_own"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'user-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'user-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "user_audio_delete_own" on storage.objects;
create policy "user_audio_delete_own"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'user-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

insert into public.plans (plan_id, name, description, monthly_inr, yearly_inr, monthly_usd, yearly_usd, features)
values
  ('free_trial', 'Free Trial', '3 videos at 480p, no card required', 0, 0, 0, 0, '["3 videos", "480p", "No card required"]'::jsonb),
  ('starter', 'Starter', '20 videos monthly at 480p', 449, 5388, 4.99, 59.88, '["20 videos / month", "480p", "Margin target 76%"]'::jsonb),
  ('creator', 'Creator', '50 videos monthly at 720p', 1299, 15588, 14.99, 179.88, '["50 videos / month", "720p", "Margin target 64%"]'::jsonb),
  ('pro', 'Pro', '100 videos monthly at 720p HQ', 2599, 31188, 29.99, 359.88, '["100 videos / month", "720p HQ", "Margin target 69%"]'::jsonb),
  ('studio', 'Studio', 'Unlimited videos at 1080p', 8499, 101988, 99.99, 1199.88, '["Unlimited videos", "1080p", "Margin target 50%"]'::jsonb),
  ('credits_100', 'Credits 100', 'Pay-per-use credits pack', 849, 849, 9.99, 9.99, '["100 credits", "Best for 480p"]'::jsonb),
  ('credits_250', 'Credits 250', 'Pay-per-use credits pack', 1699, 1699, 19.99, 19.99, '["250 credits", "Best for 720p"]'::jsonb),
  ('credits_500', 'Credits 500', 'Pay-per-use credits pack', 2999, 2999, 34.99, 34.99, '["500 credits", "Best for 720p HQ"]'::jsonb),
  ('credits_1000', 'Credits 1000', 'Pay-per-use credits pack', 5099, 5099, 59.99, 59.99, '["1000 credits", "Best for 1080p"]'::jsonb)
on conflict (plan_id) do update
set
  name = excluded.name,
  description = excluded.description,
  monthly_inr = excluded.monthly_inr,
  yearly_inr = excluded.yearly_inr,
  monthly_usd = excluded.monthly_usd,
  yearly_usd = excluded.yearly_usd,
  features = excluded.features,
  is_active = true;
