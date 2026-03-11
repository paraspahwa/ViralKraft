create extension if not exists "pgcrypto";

create table if not exists public.plans (
  plan_id text primary key,
  name text not null,
  description text,
  monthly_inr integer not null,
  yearly_inr integer not null,
  monthly_usd integer not null,
  yearly_usd integer not null,
  features jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

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

insert into public.plans (plan_id, name, description, monthly_inr, yearly_inr, monthly_usd, yearly_usd, features)
values
  ('starter', 'Starter', 'Creators starting their short-form engine', 1499, 14990, 29, 290, '["20 videos / month", "Basic analytics", "Email support"]'::jsonb),
  ('growth', 'Growth', 'Teams scaling multiple campaigns every week', 3999, 39990, 79, 790, '["100 videos / month", "AI retention optimization", "Priority support"]'::jsonb),
  ('scale', 'Scale', 'High-volume brands running full-funnel video ops', 9999, 99990, 199, 1990, '["Unlimited videos", "Team workspace", "Dedicated success manager"]'::jsonb)
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
