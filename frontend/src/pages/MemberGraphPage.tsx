import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { GraphEditor } from '../components/graph/GraphEditor'
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

  return (
    <div>
      <Link
        to={`/groups/${groupId}`}
        className="text-sm text-indigo-600 hover:underline"
      >
        ← グループに戻る
      </Link>
      <h1 className="mb-4 mt-4 text-2xl font-semibold text-slate-900">
        {memberName} の論文グラフ
      </h1>
      <GraphEditor
        userId={user.id}
        targetUserId={memberId}
        readOnly
      />
    </div>
  )
}
