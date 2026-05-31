import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function AppLayout() {
  const { user, signOut } = useAuth()
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
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link to="/" className="text-lg font-semibold tracking-tight">
            Research Compass
          </Link>
          {user && (
            <nav className="flex items-center gap-4 text-sm text-slate-600">
              <Link to="/" className="hover:text-slate-900">
                ダッシュボード
              </Link>
              <Link to="/graph" className="hover:text-slate-900">
                論文グラフ
              </Link>
              <span className="text-slate-400">|</span>
              <span>{displayName}</span>
              <button
                type="button"
                onClick={handleLogout}
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
