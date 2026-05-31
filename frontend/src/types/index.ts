export type UnderstandingLevel =
  | 'unset'
  | 'mastered'
  | 'good'
  | 'partial'
  | 'none'

export type Profile = {
  id: string
  email: string
  display_name: string
  created_at: string
}

export type PaperNode = {
  id: string
  user_id: string
  title: string
  year: number | null
  summary: string | null
  problem: string | null
  contribution: string | null
  paper_url: string | null
  prerequisites: string[]
  understanding: UnderstandingLevel
  is_relevant: boolean
  position_x: number
  position_y: number
  created_at: string
  updated_at: string
}

export type PaperEdge = {
  id: string
  user_id: string
  source_node_id: string
  target_node_id: string
  label: string | null
}

export type Memo = {
  id: string
  node_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
}

export type Group = {
  id: string
  name: string
  description: string | null
  invite_code: string
  created_by: string
  created_at: string
}

export type GroupMember = {
  id: string
  group_id: string
  user_id: string
  joined_at: string
  profiles?: Profile
}

export type MemoContent = {
  confusion: string
  note: string
}

export type PaperNodeInput = {
  title: string
  year?: number | null
  summary?: string | null
  problem?: string | null
  contribution?: string | null
  paper_url?: string | null
  prerequisites?: string[]
  understanding?: UnderstandingLevel
  is_relevant?: boolean
  position_x?: number
  position_y?: number
}

export type GraphSnapshot = {
  nodes: PaperNode[]
  edges: PaperEdge[]
}

export type Post = {
  id: string
  user_id: string
  group_id: string
  body: string
  created_at: string
  profiles?: Pick<Profile, 'id' | 'display_name'>
  groups?: Pick<Group, 'id' | 'name'>
  post_snapshots?: GraphSnapshot
  post_likes?: { user_id: string }[]
}
