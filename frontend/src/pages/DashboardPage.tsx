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

      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          to="/graph"
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
        >
          <h2 className="font-semibold text-slate-900">マイ論文グラフ</h2>
          <p className="mt-2 text-sm text-slate-600">
            ノードを追加し、論文・手法の関係を地図化
          </p>
        </Link>

        <Link
          to="/dashboard"
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
        >
          <h2 className="font-semibold text-slate-900">理解度一覧</h2>
          <p className="mt-2 text-sm text-slate-600">
            登録ノードの理解度を表形式で確認
          </p>
        </Link>

        <Link
          to="/groups"
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
        >
          <h2 className="font-semibold text-slate-900">グループ</h2>
          <p className="mt-2 text-sm text-slate-600">
            ゼミメンバーの論文図を閲覧
          </p>
        </Link>
      </div>
    </section>
  )
}
