-- Migration 004: Health Records Vault
-- vault_profiles, vault_reports, vault_report_values
-- RLS: users can only access their own profiles/reports
-- Hard-delete RPC: delete_profile_data(profile_id)

-- ── Tables ────────────────────────────────────────────────────────────────────

create table if not exists public.vault_profiles (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  relation     text not null check (relation in ('self','parent','spouse','child','other')),
  dob          date,
  sex          text check (sex in ('male','female','other')),
  is_primary   boolean not null default false,
  created_at   timestamptz not null default now()
);

create table if not exists public.vault_reports (
  id                  uuid primary key default gen_random_uuid(),
  profile_id          uuid not null references public.vault_profiles(id) on delete cascade,
  title               text not null,
  report_type         text not null check (report_type in ('cbc','thyroid','lipid','glucose','liver','other')),
  report_date         date not null default current_date,
  file_url            text,           -- Cloudinary signed URL (not yet used; stored null)
  raw_extracted_text  text,
  ai_explanation_json jsonb,
  overall_assessment  text check (overall_assessment in (
    'requires_urgent_attention','needs_follow_up','routine_monitoring','all_clear'
  )),
  created_at          timestamptz not null default now()
);

create table if not exists public.vault_report_values (
  id               uuid primary key default gen_random_uuid(),
  report_id        uuid not null references public.vault_reports(id) on delete cascade,
  parameter_name   text not null,
  value            numeric,
  unit             text,
  ref_low          numeric,
  ref_high         numeric,
  flag             text check (flag in ('low','normal','high')),
  measured_on      date not null default current_date
);

-- ── Indexes ───────────────────────────────────────────────────────────────────

create index if not exists idx_vault_profiles_user_id   on public.vault_profiles(user_id);
create index if not exists idx_vault_reports_profile_id on public.vault_reports(profile_id);
create index if not exists idx_vault_reports_created_at on public.vault_reports(created_at desc);
create index if not exists idx_vault_values_report_id   on public.vault_report_values(report_id);
create index if not exists idx_vault_values_param_name  on public.vault_report_values(report_id, parameter_name);

-- ── Row-Level Security ────────────────────────────────────────────────────────

alter table public.vault_profiles      enable row level security;
alter table public.vault_reports       enable row level security;
alter table public.vault_report_values enable row level security;

-- vault_profiles: owner access only
create policy "vault_profiles: owner select"
  on public.vault_profiles for select
  using (auth.uid() = user_id);

create policy "vault_profiles: owner insert"
  on public.vault_profiles for insert
  with check (auth.uid() = user_id);

create policy "vault_profiles: owner update"
  on public.vault_profiles for update
  using (auth.uid() = user_id);

create policy "vault_profiles: owner delete"
  on public.vault_profiles for delete
  using (auth.uid() = user_id);

-- vault_reports: access through owning profile
create policy "vault_reports: owner select"
  on public.vault_reports for select
  using (
    exists (
      select 1 from public.vault_profiles p
      where p.id = vault_reports.profile_id
        and p.user_id = auth.uid()
    )
  );

create policy "vault_reports: owner insert"
  on public.vault_reports for insert
  with check (
    exists (
      select 1 from public.vault_profiles p
      where p.id = vault_reports.profile_id
        and p.user_id = auth.uid()
    )
  );

create policy "vault_reports: owner update"
  on public.vault_reports for update
  using (
    exists (
      select 1 from public.vault_profiles p
      where p.id = vault_reports.profile_id
        and p.user_id = auth.uid()
    )
  );

create policy "vault_reports: owner delete"
  on public.vault_reports for delete
  using (
    exists (
      select 1 from public.vault_profiles p
      where p.id = vault_reports.profile_id
        and p.user_id = auth.uid()
    )
  );

-- vault_report_values: access through owning report → profile
create policy "vault_report_values: owner select"
  on public.vault_report_values for select
  using (
    exists (
      select 1
      from public.vault_reports r
      join public.vault_profiles p on p.id = r.profile_id
      where r.id = vault_report_values.report_id
        and p.user_id = auth.uid()
    )
  );

create policy "vault_report_values: owner insert"
  on public.vault_report_values for insert
  with check (
    exists (
      select 1
      from public.vault_reports r
      join public.vault_profiles p on p.id = r.profile_id
      where r.id = vault_report_values.report_id
        and p.user_id = auth.uid()
    )
  );

create policy "vault_report_values: owner delete"
  on public.vault_report_values for delete
  using (
    exists (
      select 1
      from public.vault_reports r
      join public.vault_profiles p on p.id = r.profile_id
      where r.id = vault_report_values.report_id
        and p.user_id = auth.uid()
    )
  );

-- ── Grants ────────────────────────────────────────────────────────────────────

grant select, insert, update, delete on public.vault_profiles      to authenticated;
grant select, insert, update, delete on public.vault_reports       to authenticated;
grant select, insert, update, delete on public.vault_report_values to authenticated;

-- ── Hard-delete RPC ───────────────────────────────────────────────────────────
-- Cascades: vault_reports + vault_report_values deleted via FK cascade.
-- Caller must own the profile (RLS enforced above; this runs as SECURITY DEFINER
-- so it can also clean up any future Cloudinary side-effects in one transaction).

create or replace function public.delete_profile_data(p_profile_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  -- Verify the calling user owns this profile
  select user_id into v_user_id
  from public.vault_profiles
  where id = p_profile_id;

  if v_user_id is null then
    raise exception 'Profile not found';
  end if;

  if v_user_id != auth.uid() then
    raise exception 'Access denied';
  end if;

  -- Cascade delete: values → reports → profile (FK ON DELETE CASCADE handles children)
  delete from public.vault_profiles where id = p_profile_id;
end;
$$;

grant execute on function public.delete_profile_data(uuid) to authenticated;
