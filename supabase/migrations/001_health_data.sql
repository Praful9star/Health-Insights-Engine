-- Run this in your Supabase SQL editor to enable cloud sync and user profiles for CureCheck.

-- User profiles table (name, age, gender, blood group, city, allergies)
create table if not exists public.user_profiles (
  id          uuid references auth.users on delete cascade primary key,
  name        text    not null default '',
  age         text    not null default '',
  gender      text    not null default '',
  blood_group text    not null default '',
  city        text    not null default '',
  allergies   text    not null default '',
  updated_at  timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

create policy if not exists "Users manage own profile"
  on public.user_profiles
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Health data sync table (fitness, timeline, challenges, reminders, saved articles)
create table if not exists public.user_health_data (
  user_id     uuid references auth.users on delete cascade primary key,
  fitness     jsonb not null default '[]'::jsonb,
  timeline    jsonb not null default '[]'::jsonb,
  challenges  jsonb not null default '[]'::jsonb,
  reminders   jsonb not null default '[]'::jsonb,
  saved_articles jsonb not null default '[]'::jsonb,
  updated_at  timestamptz not null default now()
);

alter table public.user_health_data enable row level security;

create policy if not exists "Users manage own health data"
  on public.user_health_data
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
