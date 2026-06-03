import type { Group, GroupMember } from '../../types'
import { generateInviteCode } from '../constants'
import { supabase } from '../supabase'

export async function fetchGroups(): Promise<Group[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function fetchGroup(id: string): Promise<Group | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function createGroup(
  userId: string,
  name: string,
  description: string,
): Promise<Group> {
  if (!supabase) throw new Error('Supabase が未設定です')
  const invite_code = generateInviteCode()
  const { data, error } = await supabase
    .from('groups')
    .insert({ name, description: description || null, invite_code, created_by: userId })
    .select()
    .single()
  if (error) throw error
  const { error: memberError } = await supabase
    .from('group_members')
    .insert({ group_id: data.id, user_id: userId })
  if (memberError) throw memberError
  return data
}

export async function joinGroupByCode(
  _userId: string,
  inviteCode: string,
): Promise<Group> {
  if (!supabase) throw new Error('Supabase が未設定です')
  const { data: group, error } = await supabase.rpc('join_group_by_invite_code', {
    p_invite_code: inviteCode.trim(),
  })
  if (error) {
    const msg = error.message ?? ''
    if (msg.includes('INVITE_CODE_NOT_FOUND')) {
      throw new Error('招待コードが見つかりません')
    }
    if (msg.includes('ALREADY_MEMBER')) {
      throw new Error('すでに参加済みです')
    }
    throw error
  }
  if (!group) throw new Error('招待コードが見つかりません')
  return group as Group
}

export async function fetchGroupMembers(groupId: string): Promise<GroupMember[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('group_members')
    .select('*, profiles(id, email, display_name, created_at)')
    .eq('group_id', groupId)
    .order('joined_at')
  if (error) throw error
  return (data ?? []) as GroupMember[]
}

function mapRpcError(message: string, map: Record<string, string>): string | null {
  for (const [key, text] of Object.entries(map)) {
    if (message.includes(key)) return text
  }
  return null
}

export async function leaveGroup(groupId: string): Promise<void> {
  if (!supabase) throw new Error('Supabase が未設定です')
  const { error } = await supabase.rpc('leave_group', { p_group_id: groupId })
  if (error) {
    const mapped = mapRpcError(error.message ?? '', {
      GROUP_NOT_FOUND: 'グループが見つかりません',
      OWNER_CANNOT_LEAVE: 'オーナーは「グループを削除」してください。退出だけでは離れられません',
      NOT_A_MEMBER: 'このグループのメンバーではありません',
    })
    throw new Error(mapped ?? error.message)
  }
}

export async function deleteGroup(groupId: string): Promise<void> {
  if (!supabase) throw new Error('Supabase が未設定です')
  const { error } = await supabase.from('groups').delete().eq('id', groupId)
  if (error) throw error
}
