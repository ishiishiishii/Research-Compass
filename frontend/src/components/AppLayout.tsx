import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useTutorialContext } from '../hooks/useTutorialContext'
import { useAuth } from '../hooks/useAuth'

export function AppLayout() {
  const { user, signOut } = useAuth()
  const { openTutorial, appEnabled } = useTutorialContext()
  const navigate = useNavigate()

  const displayName =
    user?.user_metadata?.display_name ?? user?.email?.split('@')[0]

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <Link to="/" className="text-lg font-semibold tracking-tight">
            Research Compass
          </Link>
          {user && (
            <nav className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
              {appEnabled && (
                <>
                  <Link to="/graph" className="hover:text-slate-900">
                    論文グラフ
                  </Link>
                  <Link to="/dashboard" className="hover:text-slate-900">
                    理解度
                  </Link>
                  <Link to="/groups" className="hover:text-slate-900">
                    グループ
                  </Link>
                  <Link to="/feed" className="hover:text-slate-900">
                    フィード
                  </Link>
                </>
              )}
              <button
                type="button"
                onClick={openTutorial}
                className="text-indigo-600 hover:text-indigo-700"
              >
                チュートリアル
              </button>
              <span className="text-slate-400">|</span>
              <span>{displayName}</span>
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="rounded-lg border border-slate-300 px-3 py-1.5 hover:bg-slate-50"
              >
                ログアウト
              </button>
            </nav>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
