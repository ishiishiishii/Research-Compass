import { type FormEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { SnapshotGraphView } from '../components/graph/SnapshotGraphView'
import { useAuth } from '../hooks/useAuth'
import { fetchGroups } from '../lib/api/groups'
import { fetchEdges, fetchNodes } from '../lib/api/nodes'
import {
  createPost,
  deletePost,
  fetchPosts,
  postIsLikedBy,
  postLikeCount,
  togglePostLike,
} from '../lib/api/posts'
import type { Group, Post } from '../types'

export function FeedPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [body, setBody] = useState('')
  const [groupId, setGroupId] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function loadPosts(query?: string) {
    setLoading(true)
    setError(null)
    try {
      setPosts(await fetchPosts(query))
    } catch (err) {
      setError(err instanceof Error ? err.message : '読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch
    void Promise.all([loadPosts(), fetchGroups().then(setGroups)]).catch(() => {})
  }, [])

  if (!user) return null

  const userId = user.id
  const effectiveGroupId = groupId || groups[0]?.id || ''

  async function handleSearch(e: FormEvent) {
    e.preventDefault()
    await loadPosts(search)
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    if (!body.trim() || !effectiveGroupId) return
    setSubmitting(true)
    setError(null)
    try {
      const [nodes, edges] = await Promise.all([fetchNodes(userId), fetchEdges(userId)])
      const post = await createPost(userId, effectiveGroupId, body, { nodes, edges })
      setPosts((prev) => [post, ...prev])
      setBody('')
    } catch (err) {
      setError(err instanceof Error ? err.message : '投稿に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleLike(post: Post) {
    const liked = postIsLikedBy(post, userId)
    try {
      await togglePostLike(post.id, userId, liked)
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== post.id) return p
          const likes = p.post_likes ?? []
          return {
            ...p,
            post_likes: liked
              ? likes.filter((l) => l.user_id !== userId)
              : [...likes, { user_id: userId }],
          }
        }),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'いいねに失敗しました')
    }
  }

  async function handleDelete(postId: string) {
    if (!confirm('この投稿を削除しますか？')) return
    try {
      await deletePost(postId)
      setPosts((prev) => prev.filter((p) => p.id !== postId))
    } catch (err) {
      setError(err instanceof Error ? err.message : '削除に失敗しました')
    }
  }

  return (
    <section className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">フィード</h1>
        <p className="mt-2 text-slate-600">
          グループメンバー向けに、今の論文マップとメモを投稿できます
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900">新規投稿</h2>
        <p className="mt-1 text-sm text-slate-500">
          投稿時点のマイ論文グラフがスナップショットとして保存されます
        </p>

        {groups.length === 0 ? (
          <p className="mt-4 text-sm text-amber-700">
            グループに参加してから投稿できます。{' '}
            <Link to="/groups" className="font-medium text-indigo-600 hover:underline">
              グループへ
            </Link>
          </p>
        ) : (
          <form onSubmit={(e) => void handleCreate(e)} className="mt-4 space-y-4">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">投稿先グループ</span>
              <select
                value={effectiveGroupId}
                onChange={(e) => setGroupId(e.target.value)}
                className="field-input"
              >
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">テキスト</span>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                required
                placeholder="今日の学び、読んだ論文の感想など..."
                className="field-input"
              />
            </label>
            <button
              type="submit"
              disabled={submitting || !body.trim()}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {submitting ? '投稿中...' : '投稿する'}
            </button>
          </form>
        )}
      </div>

      <form onSubmit={(e) => void handleSearch(e)} className="flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="投稿を検索..."
          className="field-input flex-1"
        />
        <button
          type="submit"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-white"
        >
          検索
        </button>
        {search && (
          <button
            type="button"
            onClick={() => {
              setSearch('')
              void loadPosts()
            }}
            className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:text-slate-700"
          >
            クリア
          </button>
        )}
      </form>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {loading ? (
        <p className="text-slate-500">読み込み中...</p>
      ) : posts.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-slate-500">
          まだ投稿がありません
        </p>
      ) : (
        <ul className="space-y-6">
          {posts.map((post) => (
            <li
              key={post.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="border-b border-slate-100 px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {post.profiles?.display_name ?? 'ユーザー'}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {post.groups?.name ?? 'グループ'} ·{' '}
                      {new Date(post.created_at).toLocaleString('ja-JP')}
                    </p>
                  </div>
                  {post.user_id === userId && (
                    <button
                      type="button"
                      onClick={() => void handleDelete(post.id)}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      削除
                    </button>
                  )}
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
                  {post.body}
                </p>
              </div>

              {post.post_snapshots && (
                <div className="px-5 py-4">
                  <p className="mb-2 text-xs font-medium text-slate-500">投稿時の論文マップ</p>
                  <SnapshotGraphView
                    nodes={post.post_snapshots.nodes}
                    edges={post.post_snapshots.edges}
                    height={280}
                  />
                </div>
              )}

              <div className="border-t border-slate-100 px-5 py-3">
                <button
                  type="button"
                  onClick={() => void handleLike(post)}
                  className={`text-sm font-medium ${
                    postIsLikedBy(post, userId)
                      ? 'text-rose-600'
                      : 'text-slate-600 hover:text-rose-600'
                  }`}
                >
                  {postIsLikedBy(post, userId) ? '♥ いいね済み' : '♡ いいね'} (
                  {postLikeCount(post)})
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
