-- Research Compass: initial schema (MVP v1.0)

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------
create type public.understanding_level as enum (
  'unset',
  'mastered',
  'good',
  'partial',
  'none'
);

-- ---------------------------------------------------------------------------
-- Profiles (extends Supabase Auth users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Groups
-- ---------------------------------------------------------------------------
create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  invite_code text not null unique,
  created_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now()
);

create table public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique (group_id, user_id)
);

-- ---------------------------------------------------------------------------
-- Graph: nodes & edges
-- ---------------------------------------------------------------------------
create table public.nodes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  year int,
  summary text,
  problem text,
  contribution text,
  paper_url text,
  prerequisites jsonb not null default '[]'::jsonb,
  understanding public.understanding_level not null default 'unset',
  is_relevant boolean not null default true,
  position_x double precision not null default 0,
  position_y double precision not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.edges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  source_node_id uuid not null references public.nodes (id) on delete cascade,
  target_node_id uuid not null references public.nodes (id) on delete cascade,
  label text,
  unique (user_id, source_node_id, target_node_id)
);

create table public.memos (
  id uuid primary key default gen_random_uuid(),
  node_id uuid not null references public.nodes (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index nodes_user_id_idx on public.nodes (user_id);
create index edges_user_id_idx on public.edges (user_id);
create index group_members_group_id_idx on public.group_members (group_id);
create index group_members_user_id_idx on public.group_members (user_id);

-- ---------------------------------------------------------------------------
-- Auto-create profile on signup
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger nodes_updated_at
  before update on public.nodes
  for each row execute function public.set_updated_at();

create trigger memos_updated_at
  before update on public.memos
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Helper: same group membership check
-- ---------------------------------------------------------------------------
create or replace function public.are_group_members(user_a uuid, user_b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.group_members gm_a
    join public.group_members gm_b
      on gm_a.group_id = gm_b.group_id
    where gm_a.user_id = user_a
      and gm_b.user_id = user_b
  );
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.nodes enable row level security;
alter table public.edges enable row level security;
alter table public.memos enable row level security;

-- profiles
create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- groups
create policy "Members can view their groups"
  on public.groups for select
  to authenticated
  using (
    exists (
      select 1 from public.group_members gm
      where gm.group_id = groups.id and gm.user_id = auth.uid()
    )
    or created_by = auth.uid()
  );

create policy "Authenticated users can create groups"
  on public.groups for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "Creators can update their groups"
  on public.groups for update
  to authenticated
  using (created_by = auth.uid());

-- group_members
create policy "Members can view group membership"
  on public.group_members for select
  to authenticated
  using (
    exists (
      select 1 from public.group_members gm
      where gm.group_id = group_members.group_id and gm.user_id = auth.uid()
    )
  );

create policy "Users can join groups"
  on public.group_members for insert
  to authenticated
  with check (user_id = auth.uid());

-- nodes
create policy "Users manage own nodes"
  on public.nodes for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Group members can view others nodes"
  on public.nodes for select
  to authenticated
  using (public.are_group_members(auth.uid(), user_id));

-- edges
create policy "Users manage own edges"
  on public.edges for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Group members can view others edges"
  on public.edges for select
  to authenticated
  using (public.are_group_members(auth.uid(), user_id));

-- memos
create policy "Users manage own memos"
  on public.memos for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Group members can view others memos"
  on public.memos for select
  to authenticated
  using (public.are_group_members(auth.uid(), user_id));
