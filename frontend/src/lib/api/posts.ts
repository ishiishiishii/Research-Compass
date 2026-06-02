import type { GraphSnapshot, PaperEdge, PaperNode, Post } from '../../types'
import { supabase } from '../supabase'

const POST_SELECT = `
  id,
  user_id,
  group_id,
  body,
  created_at,
  profiles!posts_user_id_fkey(id, display_name),
  groups(id, name),
  post_snapshots(nodes, edges),
  post_likes(user_id)
`

function normalizeSnapshot(raw: unknown): GraphSnapshot | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const s = raw as { nodes?: unknown; edges?: unknown }
  return {
    nodes: (Array.isArray(s.nodes) ? s.nodes : []) as PaperNode[],
    edges: (Array.isArray(s.edges) ? s.edges : []) as PaperEdge[],
  }
}

function normalizePost(row: Record<string, unknown>): Post {
  const snapshot = row.post_snapshots
  const snapObj = Array.isArray(snapshot) ? snapshot[0] : snapshot
  return {
    ...(row as Post),
    post_snapshots: normalizeSnapshot(snapObj),
    post_likes: (row.post_likes as { user_id: string }[]) ?? [],
  }
}

export async function fetchPosts(search?: string): Promise<Post[]> {
  if (!supabase) return []
  let query = supabase
    .from('posts')
    .select(POST_SELECT)
    .order('created_at', { ascending: false })
    .limit(50)

  if (search?.trim()) {
    query = query.ilike('body', `%${search.trim()}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []).map((row) => normalizePost(row as Record<string, unknown>))
}

export async function createPost(
  userId: string,
  groupId: string,
  body: string,
  snapshot: GraphSnapshot,
): Promise<Post> {
  if (!supabase) throw new Error('Supabase が未設定です')

  const { data: post, error } = await supabase
    .from('posts')
    .insert({ user_id: userId, group_id: groupId, body: body.trim() })
    .select('id')
    .single()
  if (error) throw error

  const { error: snapError } = await supabase.from('post_snapshots').insert({
    post_id: post.id,
    nodes: snapshot.nodes,
    edges: snapshot.edges,
  })
  if (snapError) throw snapError

  const { data: full, error: fetchError } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('id', post.id)
    .single()
  if (fetchError) throw fetchError
  return normalizePost(full as Record<string, unknown>)
}

export async function togglePostLike(postId: string, userId: string, liked: boolean): Promise<void> {
  if (!supabase) throw new Error('Supabase が未設定です')
  if (liked) {
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId)
    if (error) throw error
    return
  }
  const { error } = await supabase.from('post_likes').insert({ post_id: postId, user_id: userId })
  if (error) throw error
}

export async function deletePost(postId: string): Promise<void> {
  if (!supabase) throw new Error('Supabase が未設定です')
  const { error } = await supabase.from('posts').delete().eq('id', postId)
  if (error) throw error
}

export function postLikeCount(post: Post): number {
  return post.post_likes?.length ?? 0
}

export function postIsLikedBy(post: Post, userId: string): boolean {
  return post.post_likes?.some((l) => l.user_id === userId) ?? false
}
