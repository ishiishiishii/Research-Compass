import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { fetchGroup, fetchGroupMembers } from '../lib/api/groups'
import type { Group, GroupMember } from '../types'

export function GroupDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [group, setGroup] = useState<Group | null>(null)
  const [members, setMembers] = useState<GroupMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    void Promise.all([fetchGroup(id), fetchGroupMembers(id)])
      .then(([g, m]) => {
        setGroup(g)
        setMembers(m)
      })
      .finally(() => setLoading(false))
  }, [id])

  if (!user || !id) return null

  if (loading) {
    return <p className="text-slate-500">読み込み中...</p>
  }

  if (!group) {
    return <p className="text-red-600">グループが見つかりません</p>
  }

  return (
    <section className="space-y-8">
      <div>
        <Link to="/groups" className="text-sm font-medium text-indigo-600 hover:underline">
          ← グループ一覧
        </Link>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">{group.name}</h1>
          {group.description && (
            <p className="mt-2 text-slate-600">{group.description}</p>
          )}
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
            <span>
              メンバー <strong className="text-slate-800">{members.length}</strong> 人
            </span>
            <span>
              招待コード{' '}
              <code className="rounded bg-slate-100 px-2 py-0.5 font-mono text-slate-800">
                {group.invite_code}
              </code>
            </span>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">メンバーの論文マップ</h2>
            <p className="mt-1 text-sm text-slate-500">名前をクリックして閲覧できます（読み取り専用）</p>
          </div>
          <Link
            to="/feed"
            className="shrink-0 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
          >
            フィードを見る
          </Link>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => {
            const profile = member.profiles
            const name = profile?.display_name ?? '不明'
            const isSelf = member.user_id === user.id
            return (
              <li key={member.id}>
                <Link
                  to={`/groups/${id}/members/${member.user_id}`}
                  className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 group-hover:text-indigo-700">
                      {name}
                      {isSelf && (
                        <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-600">
                          自分
                        </span>
                      )}
                    </p>
                    <p className="mt-1 truncate text-sm text-slate-500">{profile?.email}</p>
                  </div>
                  <p className="mt-4 text-sm font-medium text-indigo-600 group-hover:text-indigo-700">
                    論文マップを見る →
                  </p>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
