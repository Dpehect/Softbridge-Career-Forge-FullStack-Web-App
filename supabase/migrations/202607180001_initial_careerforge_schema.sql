begin;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_path text,
  locale text check (locale in ('tr', 'en')) default 'tr',
  theme text check (theme in ('light', 'dark')) default 'light',
  career_goal_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.career_workspaces (
  user_id uuid primary key references auth.users(id) on delete cascade,
  resume jsonb not null default '{}'::jsonb,
  resume_section_order jsonb not null default '[]'::jsonb,
  coach_messages jsonb not null default '[]'::jsonb,
  forge_cv_text text not null default '',
  forge_jd_text text not null default '',
  forge_parsed_cv jsonb,
  forge_analysis jsonb,
  forge_tone text not null default 'Profesyonel',
  forge_history jsonb not null default '[]'::jsonb,
  forge_backups jsonb not null default '[]'::jsonb,
  saved_job_ids jsonb not null default '[]'::jsonb,
  applied_job_ids jsonb not null default '[]'::jsonb,
  enrolled_path_ids jsonb not null default '[]'::jsonb,
  completed_module_ids jsonb not null default '[]'::jsonb,
  last_analysis_meta jsonb,
  source_file_path text,
  migration_completed_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_usage_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  feature text not null check (char_length(feature) between 1 and 40),
  created_at timestamptz not null default now()
);

create index if not exists ai_usage_events_user_feature_created_idx
  on public.ai_usage_events (user_id, feature, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists career_workspaces_set_updated_at on public.career_workspaces;
create trigger career_workspaces_set_updated_at
before update on public.career_workspaces
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.career_workspaces enable row level security;
alter table public.ai_usage_events enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
for select to authenticated using ((select auth.uid()) = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
for insert to authenticated with check ((select auth.uid()) = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own" on public.profiles
for delete to authenticated using ((select auth.uid()) = id);

drop policy if exists "workspaces_select_own" on public.career_workspaces;
create policy "workspaces_select_own" on public.career_workspaces
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "workspaces_insert_own" on public.career_workspaces;
create policy "workspaces_insert_own" on public.career_workspaces
for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "workspaces_update_own" on public.career_workspaces;
create policy "workspaces_update_own" on public.career_workspaces
for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "workspaces_delete_own" on public.career_workspaces;
create policy "workspaces_delete_own" on public.career_workspaces
for delete to authenticated using ((select auth.uid()) = user_id);

create or replace function public.consume_ai_quota(
  p_feature text,
  p_limit integer default 20,
  p_window_seconds integer default 3600
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  recent_count integer;
begin
  if current_user_id is null then
    return false;
  end if;
  if p_feature is null or char_length(p_feature) not between 1 and 40 then
    raise exception 'invalid feature';
  end if;
  if p_limit not between 1 and 100 or p_window_seconds not between 60 and 86400 then
    raise exception 'invalid quota';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(current_user_id::text || ':' || p_feature, 0));
  select count(*) into recent_count
  from public.ai_usage_events
  where user_id = current_user_id
    and feature = p_feature
    and created_at >= now() - make_interval(secs => p_window_seconds);

  if recent_count >= p_limit then
    return false;
  end if;

  insert into public.ai_usage_events (user_id, feature) values (current_user_id, p_feature);
  return true;
end;
$$;

revoke all on public.ai_usage_events from anon, authenticated;
revoke all on function public.consume_ai_quota(text, integer, integer) from public, anon;
grant execute on function public.consume_ai_quota(text, integer, integer) to authenticated;

commit;
