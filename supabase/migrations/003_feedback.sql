-- Migration 003: feedback and bug_reports tables

create table if not exists public.feedback (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete set null,
  type          text not null check (type in ('rating', 'feature', 'general')),
  rating        smallint check (rating between 1 and 5),
  message       text not null,
  email         text,
  page_url      text,
  created_at    timestamptz not null default now()
);

create table if not exists public.bug_reports (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete set null,
  description   text not null,
  page_url      text,
  browser       text,
  device        text,
  email         text,
  created_at    timestamptz not null default now()
);

alter table public.feedback    enable row level security;
alter table public.bug_reports enable row level security;

create policy "Anyone can insert feedback"
  on public.feedback for insert
  with check (true);

create policy "Users view own feedback"
  on public.feedback for select
  using (auth.uid() = user_id);

create policy "Anyone can insert bug_reports"
  on public.bug_reports for insert
  with check (true);

create policy "Users view own bug_reports"
  on public.bug_reports for select
  using (auth.uid() = user_id);

create index if not exists idx_feedback_created_at    on public.feedback(created_at desc);
create index if not exists idx_bug_reports_created_at on public.bug_reports(created_at desc);
