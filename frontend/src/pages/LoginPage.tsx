import { type FormEvent, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { translateAuthError } from '../lib/auth-errors'
import { isSupabaseConfigured } from '../lib/supabase'

export function LoginPage() {
  const { signIn, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (user) {
    return <Navigate to={from} replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const result = await signIn(email, password)
    setSubmitting(false)
    if (result.error) {
      setError(translateAuthError(result.error))
      return
    }
    navigate(from, { replace: true })
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-white/60 bg-white/90 p-8 shadow-lg backdrop-blur-sm">
        <h1 className="text-2xl font-semibold text-slate-900">ログイン</h1>
        <p className="mt-2 text-sm text-slate-600">Research Compass にサインイン</p>

        {!isSupabaseConfigured() && (
          <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Supabase 未設定: 環境変数を確認してください
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            メールアドレス
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            パスワード
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </label>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm leading-relaxed text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
          >
            {submitting ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          アカウントをお持ちでない方は{' '}
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-700">
            新規登録
          </Link>
        </p>
      </div>
    </div>
  )
}
