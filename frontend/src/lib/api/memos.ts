import type { Memo } from '../../types'
import { supabase } from '../supabase'

export async function fetchMemo(
  nodeId: string,
  userId: string,
): Promise<Memo | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('memos')
    .select('*')
    .eq('node_id', nodeId)
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function upsertMemo(
  nodeId: string,
  userId: string,
  content: string,
): Promise<Memo> {
  if (!supabase) throw new Error('Supabase が未設定です')
  const existing = await fetchMemo(nodeId, userId)
  if (existing) {
    const { data, error } = await supabase
      .from('memos')
      .update({ content })
      .eq('id', existing.id)
      .select()
      .single()
    if (error) throw error
    return data
  }
  const { data, error } = await supabase
    .from('memos')
    .insert({ node_id: nodeId, user_id: userId, content })
    .select()
    .single()
  if (error) throw error
  return data
}
