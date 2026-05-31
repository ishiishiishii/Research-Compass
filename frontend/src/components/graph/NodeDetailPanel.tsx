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
    <div className="max-h-80 overflow-y-auto border-t border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">ノード詳細</h3>
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          閉じる
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
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

      <div className="mt-3 grid gap-3">
        <Field label="概要">
          <textarea value={summary} onChange={(e) => setSummary(e.target.value)} disabled={readOnly} rows={2} className="field-input" />
        </Field>
        <Field label="解決した課題">
          <textarea value={problem} onChange={(e) => setProblem(e.target.value)} disabled={readOnly} rows={2} className="field-input" />
        </Field>
        <Field label="貢献">
          <textarea value={contribution} onChange={(e) => setContribution(e.target.value)} disabled={readOnly} rows={2} className="field-input" />
        </Field>
        <Field label="論文 URL">
          <input value={paperUrl} onChange={(e) => setPaperUrl(e.target.value)} disabled={readOnly} className="field-input" />
        </Field>
        <Field label="前提知識（カンマ区切り）">
          <input value={prerequisites} onChange={(e) => setPrerequisites(e.target.value)} disabled={readOnly} className="field-input" />
        </Field>
      </div>

      <div className="mt-4 flex flex-wrap gap-4">
        <div>
          <div className="mb-1 text-xs font-medium text-slate-600">理解度</div>
          <div className="flex flex-wrap gap-1">
            {UNDERSTANDING_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                disabled={readOnly}
                onClick={() => setUnderstanding(opt.value as UnderstandingLevel)}
                className={`rounded px-2 py-1 text-sm ${
                  understanding === opt.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-slate-700 ring-1 ring-slate-300'
                }`}
              >
                {opt.symbol}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-1 text-xs font-medium text-slate-600">関連</div>
          <div className="flex gap-1">
            <ToggleBtn active={isRelevant} disabled={readOnly} onClick={() => setIsRelevant(true)}>
              関連
            </ToggleBtn>
            <ToggleBtn active={!isRelevant} disabled={readOnly} onClick={() => setIsRelevant(false)}>
              非関連
            </ToggleBtn>
          </div>
        </div>
      </div>

      {!readOnly && (
        <div className="mt-4 grid gap-3">
          <Field label="理解できなかった点">
            <textarea value={confusion} onChange={(e) => setConfusion(e.target.value)} rows={2} className="field-input" />
          </Field>
          <Field label="自由メモ">
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} className="field-input" />
          </Field>
          {memoUpdatedAt && (
            <p className="text-xs text-slate-500">
              メモ更新: {new Date(memoUpdatedAt).toLocaleString('ja-JP')}
            </p>
          )}
        </div>
      )}

      {readOnly && (confusion || note) && (
        <div className="mt-4 grid gap-3 text-sm text-slate-700">
          {confusion && (
            <div>
              <div className="text-xs font-medium text-slate-500">理解できなかった点</div>
              <p className="mt-1 whitespace-pre-wrap">{confusion}</p>
            </div>
          )}
          {note && (
            <div>
              <div className="text-xs font-medium text-slate-500">メモ</div>
              <p className="mt-1 whitespace-pre-wrap">{note}</p>
            </div>
          )}
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {!readOnly && (
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? '保存中...' : '保存'}
          </button>
          <button
            type="button"
            onClick={() => void handleDelete()}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            削除
          </button>
        </div>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>
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
      className={`rounded px-3 py-1 text-sm ${
        active ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-300'
      }`}
    >
      {children}
    </button>
  )
}
