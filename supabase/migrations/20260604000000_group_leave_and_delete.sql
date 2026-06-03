-- Allow creators to delete groups; members leave via leave_group() RPC only.

create policy "Creators can delete their groups"
  on public.groups for delete
  to authenticated
  using (created_by = auth.uid());

-- Owner cannot leave without deleting; members leave via RPC for clear errors.
create or replace function public.leave_group(p_group_id uuid)
returns void
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  v_uid uuid := auth.uid();
  v_created_by uuid;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  select created_by into v_created_by
  from public.groups
  where id = p_group_id;

  if not found then
    raise exception 'GROUP_NOT_FOUND';
  end if;

  if v_created_by = v_uid then
    raise exception 'OWNER_CANNOT_LEAVE';
  end if;

  if not public.is_group_member(p_group_id, v_uid) then
    raise exception 'NOT_A_MEMBER';
  end if;

  delete from public.group_members
  where group_id = p_group_id and user_id = v_uid;
end;
$$;

revoke all on function public.leave_group(uuid) from public;
grant execute on function public.leave_group(uuid) to authenticated;
