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
    <section>
      <Link to="/groups" className="text-sm text-indigo-600 hover:underline">
        ← グループ一覧
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-slate-900">{group.name}</h1>
      {group.description && (
        <p className="mt-2 text-slate-600">{group.description}</p>
      )}
      <p className="mt-2 text-sm text-slate-500">
        招待コード: <code className="font-mono">{group.invite_code}</code>
      </p>

      <h2 className="mb-4 mt-8 font-semibold text-slate-900">メンバー</h2>
      <ul className="space-y-3">
        {members.map((member) => {
          const profile = member.profiles
          const name = profile?.display_name ?? '不明'
          const isSelf = member.user_id === user.id
          return (
            <li key={member.id}>
              <Link
                to={`/groups/${id}/members/${member.user_id}`}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-indigo-300"
              >
                <div>
                  <div className="font-medium text-slate-900">
                    {name}
                    {isSelf && (
                      <span className="ml-2 text-xs text-slate-500">（自分）</span>
                    )}
                  </div>
                  <div className="text-sm text-slate-500">{profile?.email}</div>
                </div>
                <span className="text-sm text-indigo-600">論文図を見る →</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
