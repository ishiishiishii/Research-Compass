-- Posts with graph snapshots (group-scoped feed)

-- ---------------------------------------------------------------------------
-- Helper: group membership check by group id
-- ---------------------------------------------------------------------------
create or replace function public.is_group_member(p_group_id uuid, p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.group_members gm
    where gm.group_id = p_group_id
      and gm.user_id = p_user_id
  );
$$;

-- ---------------------------------------------------------------------------
-- Posts
-- ---------------------------------------------------------------------------
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  group_id uuid not null references public.groups (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table public.post_snapshots (
  post_id uuid primary key references public.posts (id) on delete cascade,
  nodes jsonb not null default '[]'::jsonb,
  edges jsonb not null default '[]'::jsonb
);

create table public.post_likes (
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create index posts_group_id_created_at_idx on public.posts (group_id, created_at desc);
create index posts_created_at_idx on public.posts (created_at desc);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.posts enable row level security;
alter table public.post_snapshots enable row level security;
alter table public.post_likes enable row level security;

create policy "Group members can view posts"
  on public.posts for select
  to authenticated
  using (public.is_group_member(group_id, auth.uid()));

create policy "Group members can create own posts"
  on public.posts for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and public.is_group_member(group_id, auth.uid())
  );

create policy "Authors can delete own posts"
  on public.posts for delete
  to authenticated
  using (user_id = auth.uid());

create policy "Group members can view snapshots"
  on public.post_snapshots for select
  to authenticated
  using (
    exists (
      select 1 from public.posts p
      where p.id = post_snapshots.post_id
        and public.is_group_member(p.group_id, auth.uid())
    )
  );

create policy "Authors can insert snapshots for own posts"
  on public.post_snapshots for insert
  to authenticated
  with check (
    exists (
      select 1 from public.posts p
      where p.id = post_snapshots.post_id
        and p.user_id = auth.uid()
    )
  );

create policy "Group members can view likes"
  on public.post_likes for select
  to authenticated
  using (
    exists (
      select 1 from public.posts p
      where p.id = post_likes.post_id
        and public.is_group_member(p.group_id, auth.uid())
    )
  );

create policy "Group members can like posts"
  on public.post_likes for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.posts p
      where p.id = post_likes.post_id
        and public.is_group_member(p.group_id, auth.uid())
    )
  );

create policy "Users can remove own likes"
  on public.post_likes for delete
  to authenticated
  using (user_id = auth.uid());
