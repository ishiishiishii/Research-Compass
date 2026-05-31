import type { PaperEdge, PaperNode, PaperNodeInput } from '../../types'
import { supabase } from '../supabase'

export async function fetchNodes(userId?: string): Promise<PaperNode[]> {
  if (!supabase) return []
  let query = supabase.from('nodes').select('*').order('created_at')
  if (userId) query = query.eq('user_id', userId)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []).map(normalizeNode)
}

export async function createNode(
  userId: string,
  input: PaperNodeInput,
): Promise<PaperNode> {
  if (!supabase) throw new Error('Supabase が未設定です')
  const { data, error } = await supabase
    .from('nodes')
    .insert({
      user_id: userId,
      title: input.title,
      year: input.year ?? null,
      summary: input.summary ?? null,
      problem: input.problem ?? null,
      contribution: input.contribution ?? null,
      paper_url: input.paper_url ?? null,
      prerequisites: input.prerequisites ?? [],
      understanding: input.understanding ?? 'unset',
      is_relevant: input.is_relevant ?? true,
      position_x: input.position_x ?? 0,
      position_y: input.position_y ?? 0,
    })
    .select()
    .single()
  if (error) throw error
  return normalizeNode(data)
}

export async function updateNode(
  id: string,
  patch: Partial<PaperNodeInput>,
): Promise<PaperNode> {
  if (!supabase) throw new Error('Supabase が未設定です')
  const { data, error } = await supabase
    .from('nodes')
    .update(patch)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return normalizeNode(data)
}

export async function deleteNode(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase が未設定です')
  const { error } = await supabase.from('nodes').delete().eq('id', id)
  if (error) throw error
}

export async function fetchEdges(userId?: string): Promise<PaperEdge[]> {
  if (!supabase) return []
  let query = supabase.from('edges').select('*')
  if (userId) query = query.eq('user_id', userId)
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function createEdge(
  userId: string,
  sourceNodeId: string,
  targetNodeId: string,
  label?: string | null,
): Promise<PaperEdge> {
  if (!supabase) throw new Error('Supabase が未設定です')
  const { data, error } = await supabase
    .from('edges')
    .insert({
      user_id: userId,
      source_node_id: sourceNodeId,
      target_node_id: targetNodeId,
      label: label ?? null,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateEdge(
  id: string,
  patch: { label?: string | null },
): Promise<PaperEdge> {
  if (!supabase) throw new Error('Supabase が未設定です')
  const { data, error } = await supabase
    .from('edges')
    .update(patch)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteEdge(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase が未設定です')
  const { error } = await supabase.from('edges').delete().eq('id', id)
  if (error) throw error
}

function normalizeNode(row: Record<string, unknown>): PaperNode {
  return {
    ...(row as PaperNode),
    prerequisites: Array.isArray(row.prerequisites)
      ? (row.prerequisites as string[])
      : [],
  }
}
