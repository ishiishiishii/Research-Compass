import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { fetchNodes } from '../lib/api/nodes'
import { UNDERSTANDING_OPTIONS } from '../lib/constants'
import type { PaperNode } from '../types'

export function UnderstandingPage() {
  const { user } = useAuth()
  const [nodes, setNodes] = useState<PaperNode[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    void fetchNodes(user.id)
      .then(setNodes)
      .finally(() => setLoading(false))
  }, [user])

  if (!user) return null

  return (
    <section>
      <h1 className="text-2xl font-semibold text-slate-900">理解度一覧</h1>
      <p className="mt-2 text-slate-600">登録したノードの理解度サマリー</p>

      {loading ? (
        <p className="mt-8 text-slate-500">読み込み中...</p>
      ) : nodes.length === 0 ? (
        <p className="mt-8 text-slate-500">
          ノードがありません。{' '}
          <Link to="/graph" className="text-indigo-600 hover:underline">
            グラフを作成
          </Link>
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">手法名</th>
                <th className="px-4 py-3 font-medium">年</th>
                <th className="px-4 py-3 font-medium">理解度</th>
                <th className="px-4 py-3 font-medium">関連</th>
              </tr>
            </thead>
            <tbody>
              {nodes.map((node) => (
                <tr key={node.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-slate-900">{node.title}</td>
                  <td className="px-4 py-3 text-slate-600">{node.year ?? '—'}</td>
                  <td className="px-4 py-3">
                    {UNDERSTANDING_OPTIONS.find((o) => o.value === node.understanding)?.label ??
                      '未設定'}
                  </td>
                  <td className="px-4 py-3">
                    {node.is_relevant ? (
                      <span className="text-slate-700">関連</span>
                    ) : (
                      <span className="text-slate-400">非関連</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
