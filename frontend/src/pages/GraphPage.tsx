import { useAuth } from '../hooks/useAuth'
import { GraphEditor } from '../components/graph/GraphEditor'

export function GraphPage() {
  const { user } = useAuth()
  if (!user) return null

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold text-slate-900">マイ論文グラフ</h1>
      <GraphEditor userId={user.id} />
    </div>
  )
}
