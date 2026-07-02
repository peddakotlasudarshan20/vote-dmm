-- ============================================================
-- CloudVote — Supabase schema
-- Run this in Supabase Dashboard → SQL Editor → New query
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- PROFILES ----------
-- Extends auth.users with the fields the checklist asked for.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  mobile text,
  voter_id text not null,        -- Voter ID / Aadhaar / College ID
  role text not null default 'voter' check (role in ('voter','admin')),
  status text not null default 'pending_approval'
    check (status in ('pending_approval','approved','rejected')),
  has_voted_in jsonb not null default '[]'::jsonb, -- cached list of election_ids, extra safety net
  created_at timestamptz not null default now()
);

-- Auto-create a profile row the moment someone confirms their email OTP.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, mobile, voter_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'mobile', ''),
    coalesce(new.raw_user_meta_data->>'voter_id', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------- ELECTIONS ----------
create table if not exists public.elections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  banner_url text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  results_published boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- CANDIDATES ----------
create table if not exists public.candidates (
  id uuid primary key default gen_random_uuid(),
  election_id uuid not null references public.elections(id) on delete cascade,
  name text not null,
  party_name text,
  party_symbol_url text,
  photo_url text,
  age int,
  qualification text,
  experience text,
  biography text,
  manifesto_url text,
  social_links jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------- VOTES ----------
-- One row per vote. voter_id is only readable by the voter themself + admin,
-- so ballots stay effectively secret from other voters.
create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  election_id uuid not null references public.elections(id) on delete cascade,
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  voter_id uuid not null references public.profiles(id) on delete cascade,
  reference_id text not null default upper(substr(md5(random()::text), 1, 10)),
  created_at timestamptz not null default now(),
  unique (election_id, voter_id)   -- hard DB-level guarantee: one vote per user per election
);

-- ---------- NOTIFICATIONS ----------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade, -- null = broadcast to everyone
  title text not null,
  message text not null,
  type text default 'info',
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- AUDIT LOG ----------
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  action text not null,
  details jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles enable row level security;
alter table public.elections enable row level security;
alter table public.candidates enable row level security;
alter table public.votes enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_log enable row level security;

-- helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- profiles: user sees/edits own row, admin sees/edits all
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);
create policy "profiles_admin_update_all" on public.profiles
  for update using (public.is_admin());

-- elections: any approved voter can read, only admin writes
create policy "elections_select_all" on public.elections
  for select using (true);
create policy "elections_admin_write" on public.elections
  for all using (public.is_admin()) with check (public.is_admin());

-- candidates: readable by everyone, admin writes
create policy "candidates_select_all" on public.candidates
  for select using (true);
create policy "candidates_admin_write" on public.candidates
  for all using (public.is_admin()) with check (public.is_admin());

-- votes: a voter can insert their own vote and read their own vote; admin reads all
create policy "votes_select_own_or_admin" on public.votes
  for select using (auth.uid() = voter_id or public.is_admin());
create policy "votes_insert_own" on public.votes
  for insert with check (
    auth.uid() = voter_id
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.status = 'approved')
    and exists (
      select 1 from public.elections e
      where e.id = election_id and now() between e.start_time and e.end_time
    )
  );

-- notifications: user sees own + broadcast, admin manages
create policy "notifications_select_own_or_broadcast" on public.notifications
  for select using (user_id = auth.uid() or user_id is null);
create policy "notifications_admin_write" on public.notifications
  for all using (public.is_admin()) with check (public.is_admin());

-- audit log: admin only
create policy "audit_admin_only" on public.audit_log
  for select using (public.is_admin());

-- ============================================================
-- RESULTS RPC — safe to expose publicly, only returns data once published
-- ============================================================
create or replace function public.get_results(p_election_id uuid)
returns table(candidate_id uuid, candidate_name text, party_name text, vote_count bigint)
language plpgsql security definer as $$
begin
  if not exists (select 1 from public.elections where id = p_election_id and results_published = true)
     and not public.is_admin() then
    raise exception 'Results not published yet';
  end if;

  return query
    select c.id, c.name, c.party_name, count(v.id)
    from public.candidates c
    left join public.votes v on v.candidate_id = c.id
    where c.election_id = p_election_id
    group by c.id, c.name, c.party_name
    order by count(v.id) desc;
end;
$$;

-- ============================================================
-- Seed your first admin (run AFTER you sign up once through the app UI)
-- update public.profiles set role = 'admin', status = 'approved' where email = 'owner@example.com';
-- ============================================================
