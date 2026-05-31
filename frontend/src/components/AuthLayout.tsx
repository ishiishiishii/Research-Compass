import type { ReactNode } from 'react'
import { Link, Outlet } from 'react-router-dom'

export function AuthLayout({ children }: { children?: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-indigo-50/40 to-slate-100">
      <header className="px-6 py-5">
        <Link to="/login" className="text-lg font-semibold tracking-tight text-slate-900">
          🧭 Research Compass
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 pb-12">
        {children ?? <Outlet />}
      </main>
    </div>
  )
}
