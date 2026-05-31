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
  userId: string,
  inviteCode: string,
): Promise<Group> {
  if (!supabase) throw new Error('Supabase が未設定です')
  const { data: group, error } = await supabase
    .from('groups')
    .select('*')
    .eq('invite_code', inviteCode.trim().toUpperCase())
    .maybeSingle()
  if (error) throw error
  if (!group) throw new Error('招待コードが見つかりません')
  const { error: memberError } = await supabase
    .from('group_members')
    .insert({ group_id: group.id, user_id: userId })
  if (memberError) {
    if (memberError.code === '23505') throw new Error('すでに参加済みです')
    throw memberError
  }
  return group
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
