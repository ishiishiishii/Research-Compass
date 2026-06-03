import { Link } from 'react-router-dom'
import { useTutorialContext } from '../hooks/useTutorialContext'
import { useAuth } from '../hooks/useAuth'

export function DashboardPage() {
  const { user } = useAuth()
  const { openTutorial, appEnabled } = useTutorialContext()
  const displayName =
    user?.user_metadata?.display_name ?? user?.email?.split('@')[0] ?? 'ユーザー'

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              こんにちは、{displayName} さん
            </h1>
            <p className="mt-2 text-slate-600">
              論文・研究手法を地図として可視化し、学習メモ・理解度を管理します。
            </p>
          </div>
          <button
            type="button"
            onClick={openTutorial}
            className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
          >
            使い方チュートリアル
          </button>
        </div>
      </div>

      {appEnabled ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

          <Link
            to="/feed"
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
          >
            <h2 className="font-semibold text-slate-900">フィード</h2>
            <p className="mt-2 text-sm text-slate-600">
              マップのスナップショットを投稿・閲覧
            </p>
          </Link>
        </div>
      ) : (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          チュートリアルを完了するかスキップすると、機能を使えるようになります。
        </p>
      )}
    </section>
  )
}
