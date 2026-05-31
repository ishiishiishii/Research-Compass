import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { GraphEditor } from '../components/graph/GraphEditor'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

export function MemberGraphPage() {
  const { id: groupId, userId: memberId } = useParams<{
    id: string
    userId: string
  }>()
  const { user } = useAuth()
  const [memberName, setMemberName] = useState('メンバー')

  useEffect(() => {
    if (!memberId || !supabase) return
    void supabase
      .from('profiles')
      .select('display_name')
      .eq('id', memberId)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.display_name) setMemberName(data.display_name)
      })
  }, [memberId])

  if (!user || !groupId || !memberId) return null

  const isSelf = memberId === user.id

  return (
    <div className="space-y-4">
      <Link
        to={`/groups/${groupId}`}
        className="inline-flex text-sm font-medium text-indigo-600 hover:underline"
      >
        ← メンバー一覧に戻る
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">
          {memberName} の論文マップ
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {isSelf ? '自分のグラフです' : '閲覧のみ — 編集は本人のみ可能です'}
        </p>
      </div>

      <GraphEditor userId={user.id} targetUserId={memberId} readOnly />
    </div>
  )
}
