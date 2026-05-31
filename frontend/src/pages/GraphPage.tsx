import { Link } from 'react-router-dom'

export function GraphPage() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">マイ論文グラフ</h1>
          <p className="mt-2 text-slate-600">
            React Flow によるグラフ編集は次のステップで実装します。
          </p>
        </div>
        <Link
          to="/"
          className="text-sm text-indigo-600 hover:text-indigo-700"
        >
          ダッシュボードへ
        </Link>
      </div>
    </section>
  )
}
