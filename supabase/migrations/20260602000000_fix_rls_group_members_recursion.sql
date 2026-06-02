-- Fix: RLS infinite recursion on public.group_members
-- Symptoms: "infinite recursion detected in policy for relation \"group_members\""
--
-- Root cause:
--   A policy on group_members used EXISTS (SELECT ... FROM group_members ...),
--   which triggers the same policy again, causing recursion.
--
-- Approach:
--   Move membership checks into SECURITY DEFINER functions with row_security=off,
--   then reference those functions from policies.

-- ---------------------------------------------------------------------------
-- Helper: is_group_member(group_id, user_id)
-- ---------------------------------------------------------------------------
create or replace function public.is_group_member(p_group_id uuid, p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select exists (
    select 1
    from public.group_members gm
    where gm.group_id = p_group_id
      and gm.user_id = p_user_id
  );
$$;

-- Update existing helper to bypass RLS safely.
create or replace function public.are_group_members(user_a uuid, user_b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
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
-- Policies: group_members
-- ---------------------------------------------------------------------------
drop policy if exists "Members can view group membership" on public.group_members;

create policy "Members can view group membership"
  on public.group_members for select
  to authenticated
  using (public.is_group_member(group_members.group_id, auth.uid()));

-- ---------------------------------------------------------------------------
-- Policies: groups (avoid calling group_members directly)
-- ---------------------------------------------------------------------------
drop policy if exists "Members can view their groups" on public.groups;

create policy "Members can view their groups"
  on public.groups for select
  to authenticated
  using (
    public.is_group_member(groups.id, auth.uid())
    or created_by = auth.uid()
  );

