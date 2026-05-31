import { type FormEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { createGroup, fetchGroups, joinGroupByCode } from '../lib/api/groups'
import type { Group } from '../types'

export function GroupsPage() {
  const { user } = useAuth()
  const [groups, setGroups] = useState<Group[]>([])
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
      setGroups(await fetchGroups())
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
      setError(err instanceof Error ? err.message : '作成に失敗しました')
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
      setError(err instanceof Error ? err.message : '参加に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">グループ</h1>
        <p className="mt-2 text-slate-600">ゼミメンバーと論文図を共有・閲覧</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">招待コードで参加</h2>
          <form onSubmit={(e) => void handleJoin(e)} className="mt-4 flex gap-2">
            <input
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="招待コード"
              className="field-input flex-1"
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              参加
            </button>
          </form>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">グループ作成</h2>
            {!showCreate && (
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                + 新規作成
              </button>
            )}
          </div>
          {showCreate && (
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
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  作成
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="text-sm text-slate-500"
                >
                  キャンセル
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div>
        <h2 className="mb-4 font-semibold text-slate-900">所属グループ</h2>
        {loading ? (
          <p className="text-slate-500">読み込み中...</p>
        ) : groups.length === 0 ? (
          <p className="text-slate-500">グループがありません</p>
        ) : (
          <ul className="space-y-3">
            {groups.map((group) => (
              <li key={group.id}>
                <Link
                  to={`/groups/${group.id}`}
                  className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-indigo-300"
                >
                  <div className="font-medium text-slate-900">{group.name}</div>
                  {group.description && (
                    <p className="mt-1 text-sm text-slate-600">{group.description}</p>
                  )}
                  <p className="mt-2 text-xs text-slate-500">
                    招待コード: <code className="font-mono">{group.invite_code}</code>
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
