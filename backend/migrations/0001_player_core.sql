-- 0001_player_core.sql
-- Secure client-facing tables for Kingdom.
-- Apply to the dedicated Kingdom Supabase project once it is created.

create table if not exists public.player_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  commander_name text not null check (char_length(commander_name) between 3 and 20),
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.kingdoms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 3 and 30),
  civilization_key text,
  starting_region_key text,
  town_hall_level smallint not null default 1 check (town_hall_level between 1 and 10),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.player_resources (
  user_id uuid primary key references auth.users(id) on delete cascade,
  wood bigint not null default 1000 check (wood >= 0),
  stone bigint not null default 1000 check (stone >= 0),
  food bigint not null default 1000 check (food >= 0),
  gold bigint not null default 500 check (gold >= 0),
  updated_at timestamptz not null default now()
);

alter table public.player_profiles enable row level security;
alter table public.kingdoms enable row level security;
alter table public.player_resources enable row level security;

revoke all on public.player_profiles from anon;
revoke all on public.kingdoms from anon;
revoke all on public.player_resources from anon;

grant select, insert, update on public.player_profiles to authenticated;
grant select, insert, update on public.kingdoms to authenticated;
grant select, insert, update on public.player_resources to authenticated;

create policy "profiles_select_own"
on public.player_profiles for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "profiles_insert_own"
on public.player_profiles for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "profiles_update_own"
on public.player_profiles for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "kingdoms_select_own"
on public.kingdoms for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "kingdoms_insert_own"
on public.kingdoms for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "kingdoms_update_own"
on public.kingdoms for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "resources_select_own"
on public.player_resources for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "resources_insert_own"
on public.player_resources for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "resources_update_own"
on public.player_resources for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
