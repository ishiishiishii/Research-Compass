-- Allow joining by invite code without exposing all groups via SELECT RLS.
-- Before: joinGroupByCode selected from groups, but non-members could not read any row.

create or replace function public.join_group_by_invite_code(p_invite_code text)
returns public.groups
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  v_group public.groups;
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_group
  from public.groups g
  where g.invite_code = upper(trim(p_invite_code));

  if not found then
    raise exception 'INVITE_CODE_NOT_FOUND';
  end if;

  begin
    insert into public.group_members (group_id, user_id)
    values (v_group.id, v_uid);
  exception
    when unique_violation then
      raise exception 'ALREADY_MEMBER';
  end;

  return v_group;
end;
$$;

revoke all on function public.join_group_by_invite_code(text) from public;
grant execute on function public.join_group_by_invite_code(text) to authenticated;
