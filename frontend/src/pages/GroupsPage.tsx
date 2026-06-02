import { type FormEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { createGroup, fetchGroupMembers, fetchGroups, joinGroupByCode } from '../lib/api/groups'
import type { Group } from '../types'

type GroupWithCount = Group & { member_count: number }

function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  if (err && typeof err === 'object' && 'message' in err && typeof (err as { message?: unknown }).message === 'string') {
    return (err as { message: string }).message
  }
  return fallback
}

export function GroupsPage() {
  const { user } = useAuth()
  const [groups, setGroups] = useState<GroupWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const list = await fetchGroups()
      const withCounts = await Promise.all(
        list.map(async (g) => {
          const members = await fetchGroupMembers(g.id)
          return { ...g, member_count: members.length }
        }),
      )
      setGroups(withCounts)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch groups
    void load()
  }, [])

  if (!user) return null

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    setSubmitting(true)
    setError(null)
    try {
      await createGroup(user.id, name.trim(), description.trim())
      setName('')
      setDescription('')
      setShowCreate(false)
      await load()
    } catch (err) {
      setError(errorMessage(err, 'グループの作成に失敗しました'))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleJoin(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    setSubmitting(true)
    setError(null)
    try {
      await joinGroupByCode(user.id, inviteCode.trim())
      setInviteCode('')
      await load()
    } catch (err) {
      setError(errorMessage(err, 'グループへの参加に失敗しました'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">グループ</h1>
          <p className="mt-2 text-slate-600">ゼミメンバーと論文マップを共有・閲覧</p>
        </div>
        <Link
          to="/feed"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          フィードへ
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">招待コードで参加</h2>
          <p className="mt-1 text-sm text-slate-500">ゼミの招待コードを入力してください</p>
          <form onSubmit={(e) => void handleJoin(e)} className="mt-4 flex gap-2">
            <input
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="例: SEMI2026"
              className="field-input flex-1 font-mono uppercase"
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              参加
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">グループ作成</h2>
            {!showCreate && (
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                + 新規作成
              </button>
            )}
          </div>
          {showCreate ? (
            <form onSubmit={(e) => void handleCreate(e)} className="mt-4 space-y-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="グループ名（例：〇〇ゼミ 2026）"
                className="field-input w-full"
                required
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="説明（任意）"
                rows={2}
                className="field-input w-full"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  作成
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="text-sm text-slate-500 hover:text-slate-700"
                >
                  キャンセル
                </button>
              </div>
            </form>
          ) : (
            <p className="mt-2 text-sm text-slate-500">新しいゼミグループを作成できます</p>
          )}
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">所属グループ</h2>
        {loading ? (
          <p className="text-slate-500">読み込み中...</p>
        ) : groups.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-slate-500">
            グループがありません。招待コードで参加するか、新規作成してください。
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {groups.map((group) => (
              <li key={group.id}>
                <Link
                  to={`/groups/${group.id}`}
                  className="block h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
                >
                  <div className="font-semibold text-slate-900">{group.name}</div>
                  {group.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">{group.description}</p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
                    <span>{group.member_count} 人のメンバー</span>
                    <span>
                      コード:{' '}
                      <code className="font-mono text-slate-700">{group.invite_code}</code>
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
