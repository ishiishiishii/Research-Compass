import { useEffect, useState } from 'react'
import type { PaperNode, UnderstandingLevel } from '../../types'
import { UNDERSTANDING_OPTIONS } from '../../lib/constants'
import { parseMemoContent, serializeMemoContent } from '../../lib/memo'
import { upsertMemo, fetchMemo } from '../../lib/api/memos'
import { deleteNode, updateNode } from '../../lib/api/nodes'

type NodeDetailPanelProps = {
  node: PaperNode
  userId: string
  readOnly?: boolean
  memoUserId?: string
  onUpdated: (node: PaperNode) => void
  onDeleted: (id: string) => void
  onClose: () => void
}

export function NodeDetailPanel(props: NodeDetailPanelProps) {
  return <NodeDetailPanelInner key={props.node.id} {...props} />
}

function NodeDetailPanelInner({
  node,
  userId,
  readOnly = false,
  memoUserId,
  onUpdated,
  onDeleted,
  onClose,
}: NodeDetailPanelProps) {
  const [title, setTitle] = useState(node.title)
  const [year, setYear] = useState(node.year?.toString() ?? '')
  const [summary, setSummary] = useState(node.summary ?? '')
  const [problem, setProblem] = useState(node.problem ?? '')
  const [contribution, setContribution] = useState(node.contribution ?? '')
  const [paperUrl, setPaperUrl] = useState(node.paper_url ?? '')
  const [prerequisites, setPrerequisites] = useState(node.prerequisites.join(', '))
  const [understanding, setUnderstanding] = useState(node.understanding)
  const [isRelevant, setIsRelevant] = useState(node.is_relevant)
  const [confusion, setConfusion] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [memoUpdatedAt, setMemoUpdatedAt] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  useEffect(() => {
    const owner = memoUserId ?? userId
    let cancelled = false
    void fetchMemo(node.id, owner).then((memo) => {
      if (cancelled) return
      if (memo) {
        const parsed = parseMemoContent(memo.content)
        setConfusion(parsed.confusion)
        setNote(parsed.note)
        setMemoUpdatedAt(memo.updated_at)
      }
    })
    return () => {
      cancelled = true
    }
  }, [node.id, memoUserId, userId])

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const updated = await updateNode(node.id, {
        title: title.trim(),
        year: year ? Number(year) : null,
        summary: summary || null,
        problem: problem || null,
        contribution: contribution || null,
        paper_url: paperUrl || null,
        prerequisites: prerequisites
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        understanding,
        is_relevant: isRelevant,
      })
      if (!readOnly) {
        const memo = await upsertMemo(
          node.id,
          userId,
          serializeMemoContent({ confusion, note }),
        )
        setMemoUpdatedAt(memo.updated_at)
      }
      onUpdated(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm(`「${node.title}」を削除しますか？`)) return
    try {
      await deleteNode(node.id)
      onDeleted(node.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : '削除に失敗しました')
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label="閉じる"
        className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <aside
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl sm:max-w-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="node-detail-title"
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-medium text-indigo-600">ノード詳細</p>
            <h3 id="node-detail-title" className="truncate text-lg font-semibold text-slate-900">
              {title || node.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="パネルを閉じる"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="手法名 / 論文名">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={readOnly}
                className="field-input"
              />
            </Field>
            <Field label="発表年">
              <input
                value={year}
                onChange={(e) => setYear(e.target.value)}
                disabled={readOnly}
                type="number"
                className="field-input"
              />
            </Field>
          </div>

          <div className="mt-4 grid gap-4">
            <Field label="概要">
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                disabled={readOnly}
                rows={3}
                className="field-input"
              />
            </Field>
            <Field label="解決した課題">
              <textarea
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                disabled={readOnly}
                rows={3}
                className="field-input"
              />
            </Field>
            <Field label="貢献">
              <textarea
                value={contribution}
                onChange={(e) => setContribution(e.target.value)}
                disabled={readOnly}
                rows={3}
                className="field-input"
              />
            </Field>
            <Field label="論文 URL">
              <input
                value={paperUrl}
                onChange={(e) => setPaperUrl(e.target.value)}
                disabled={readOnly}
                className="field-input"
                placeholder="https://..."
              />
            </Field>
            <Field label="前提知識（カンマ区切り）">
              <input
                value={prerequisites}
                onChange={(e) => setPrerequisites(e.target.value)}
                disabled={readOnly}
                className="field-input"
              />
            </Field>
          </div>

          <div className="mt-5 space-y-4 rounded-lg bg-slate-50 p-4">
            <div>
              <div className="mb-2 text-xs font-medium text-slate-600">理解度</div>
              <div className="flex flex-wrap gap-2">
                {UNDERSTANDING_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={readOnly}
                    onClick={() => setUnderstanding(opt.value as UnderstandingLevel)}
                    className={`min-w-[2.5rem] rounded-lg px-3 py-2 text-sm font-medium ${
                      understanding === opt.value
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {opt.symbol}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-1 text-xs font-medium text-slate-600">
                研究テーマとの関連
              </div>
              <p className="mb-2 text-xs leading-relaxed text-slate-500">
                今の研究・学習の中心にある論文かどうかを示します。非関連にするとグラフ上で薄く表示され、読んだ履歴は残ります。
              </p>
              <div className="flex gap-2">
                <ToggleBtn
                  active={isRelevant}
                  disabled={readOnly}
                  onClick={() => setIsRelevant(true)}
                >
                  関連（通常表示）
                </ToggleBtn>
                <ToggleBtn
                  active={!isRelevant}
                  disabled={readOnly}
                  onClick={() => setIsRelevant(false)}
                >
                  非関連（薄く表示）
                </ToggleBtn>
              </div>
            </div>
          </div>

          {!readOnly && (
            <div className="mt-5 grid gap-4">
              <Field label="理解できなかった点">
                <textarea
                  value={confusion}
                  onChange={(e) => setConfusion(e.target.value)}
                  rows={3}
                  className="field-input"
                  placeholder="わからなかった概念や式など"
                />
              </Field>
              <Field label="自由メモ">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="field-input"
                  placeholder="読んだ感想、関連論文など"
                />
              </Field>
              {memoUpdatedAt && (
                <p className="text-xs text-slate-500">
                  メモ更新: {new Date(memoUpdatedAt).toLocaleString('ja-JP')}
                </p>
              )}
            </div>
          )}

          {readOnly && (confusion || note) && (
            <div className="mt-5 grid gap-4 text-sm text-slate-700">
              {confusion && (
                <div className="rounded-lg bg-slate-50 p-3">
                  <div className="text-xs font-medium text-slate-500">理解できなかった点</div>
                  <p className="mt-1 whitespace-pre-wrap">{confusion}</p>
                </div>
              )}
              {note && (
                <div className="rounded-lg bg-slate-50 p-3">
                  <div className="text-xs font-medium text-slate-500">メモ</div>
                  <p className="mt-1 whitespace-pre-wrap">{note}</p>
                </div>
              )}
            </div>
          )}

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}
        </div>

        {!readOnly && (
          <footer className="flex shrink-0 gap-2 border-t border-slate-200 bg-white px-5 py-4">
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
              className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? '保存中...' : '保存'}
            </button>
            <button
              type="button"
              onClick={() => void handleDelete()}
              className="rounded-lg border border-red-300 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              削除
            </button>
          </footer>
        )}
      </aside>
    </>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-xs font-medium text-slate-600">{label}</span>
      {children}
    </label>
  )
}

function ToggleBtn({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-sm font-medium ${
        active
          ? 'bg-indigo-600 text-white shadow-sm'
          : 'bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50'
      }`}
    >
      {children}
    </button>
  )
}
