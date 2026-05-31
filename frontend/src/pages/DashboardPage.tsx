import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function DashboardPage() {
  const { user } = useAuth()
  const displayName =
    user?.user_metadata?.display_name ?? user?.email?.split('@')[0] ?? 'ユーザー'

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">
          こんにちは、{displayName} さん
        </h1>
        <p className="mt-2 text-slate-600">
          論文・研究手法を地図として可視化し、学習メモ・理解度を管理します。
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          to="/graph"
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
        >
          <h2 className="font-semibold text-slate-900">マイ論文グラフ</h2>
          <p className="mt-2 text-sm text-slate-600">
            ノードを追加し、論文・手法の関係を地図化する
          </p>
        </Link>

        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-500">
          <h2 className="font-semibold text-slate-700">グループ</h2>
          <p className="mt-2 text-sm">近日実装予定</p>
        </div>
      </div>
    </section>
  )
}
