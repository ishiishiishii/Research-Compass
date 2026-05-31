import { Link, Outlet } from 'react-router-dom'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link to="/" className="text-lg font-semibold tracking-tight">
            Research Compass
          </Link>
          <nav className="flex gap-4 text-sm text-slate-600">
            <Link to="/" className="hover:text-slate-900">
              Dashboard
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
