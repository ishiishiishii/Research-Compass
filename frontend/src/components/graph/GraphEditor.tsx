import { useCallback, useEffect, useMemo, useState, type FormEvent, type MouseEvent } from 'react'
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  type OnNodeDrag,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import type { PaperEdge, PaperNode } from '../../types'
import {
  createEdge,
  createNode,
  deleteEdge,
  fetchEdges,
  fetchNodes,
  updateEdge,
  updateNode,
} from '../../lib/api/nodes'
import { edgeExists, findNodeByTitle, toFlowEdges, toFlowNodes, type PaperFlowNode } from '../../lib/graph-utils'
import { MidpointEdge } from './MidpointEdge'
import { PaperNodeComponent } from './PaperNode'
import { NodeDetailPanel } from './NodeDetailPanel'

const nodeTypes = { paper: PaperNodeComponent }
const edgeTypes = { midpoint: MidpointEdge }

type ConnectMode = 'select' | 'drag' | 'name'

type GraphEditorProps = {
  userId: string
  readOnly?: boolean
  targetUserId?: string
  onSelectNode?: (node: PaperNode | null) => void
}

export function GraphEditor({
  userId,
  readOnly = false,
  targetUserId,
}: GraphEditorProps) {
  const ownerId = targetUserId ?? userId
  const [dbNodes, setDbNodes] = useState<PaperNode[]>([])
  const [dbEdges, setDbEdges] = useState<PaperEdge[]>([])
  const [relevantOnly, setRelevantOnly] = useState(false)
  const [selectedNode, setSelectedNode] = useState<PaperNode | null>(null)
  const [connectMode, setConnectMode] = useState<ConnectMode>('select')
  const [linkSourceId, setLinkSourceId] = useState<string | null>(null)
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null)
  const [edgeLabelDraft, setEdgeLabelDraft] = useState('')
  const [nameSourceTitle, setNameSourceTitle] = useState('')
  const [nameTargetTitle, setNameTargetTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [nodes, setNodes, onNodesChange] = useNodesState<PaperFlowNode>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  const loadGraph = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [n, e] = await Promise.all([fetchNodes(ownerId), fetchEdges(ownerId)])
      setDbNodes(n)
      setDbEdges(e)
    } catch (err) {
      setError(err instanceof Error ? err.message : '読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }, [ownerId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch graph data
    void loadGraph()
  }, [ownerId, loadGraph])

  const flowNodes = useMemo(
    () =>
      toFlowNodes(dbNodes, relevantOnly, {
        linkSourceId,
        showHandles: connectMode === 'drag',
      }),
    [dbNodes, relevantOnly, linkSourceId, connectMode],
  )
  const visibleIds = useMemo(
    () => new Set(flowNodes.map((n) => n.id)),
    [flowNodes],
  )
  const flowEdges = useMemo(
    () => toFlowEdges(dbEdges, visibleIds, selectedEdgeId),
    [dbEdges, visibleIds, selectedEdgeId],
  )

  useEffect(() => {
    setNodes(flowNodes)
    setEdges(flowEdges)
  }, [flowNodes, flowEdges, setNodes, setEdges])

  const activeNode =
    selectedNode && visibleIds.has(selectedNode.id) ? selectedNode : null

  const tryCreateEdge = useCallback(
    async (sourceId: string, targetId: string) => {
      if (sourceId === targetId) return
      if (edgeExists(dbEdges, sourceId, targetId)) {
        setError('この2つのノードはすでに結ばれています')
        return
      }
      try {
        const edge = await createEdge(userId, sourceId, targetId)
        setDbEdges((prev) => [...prev, edge])
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エッジ作成に失敗しました')
      }
    },
    [dbEdges, userId],
  )

  const onConnect = useCallback(
    async (connection: Connection) => {
      if (readOnly || connectMode !== 'drag' || !connection.source || !connection.target) {
        return
      }
      await tryCreateEdge(connection.source, connection.target)
    },
    [readOnly, connectMode, tryCreateEdge],
  )

  const onNodeDragStop: OnNodeDrag = useCallback(
    async (_event, node: Node) => {
      if (readOnly) return
      try {
        const updated = await updateNode(node.id, {
          position_x: node.position.x,
          position_y: node.position.y,
        })
        setDbNodes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)))
      } catch (err) {
        setError(err instanceof Error ? err.message : '位置の保存に失敗しました')
      }
    },
    [readOnly],
  )

  const onNodeClick = useCallback(
    (_: MouseEvent, node: Node) => {
      const paper = (node as PaperFlowNode).data.node

      if (!readOnly && connectMode === 'select') {
        if (linkSourceId) {
          if (linkSourceId === node.id) {
            setLinkSourceId(null)
          } else {
            void tryCreateEdge(linkSourceId, node.id)
            setLinkSourceId(null)
          }
        } else {
          setLinkSourceId(node.id)
        }
      }

      setSelectedNode(paper)
      setSelectedEdgeId(null)
    },
    [readOnly, connectMode, linkSourceId, tryCreateEdge],
  )

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
    setLinkSourceId(null)
    setSelectedEdgeId(null)
  }, [])

  const deleteSelectedEdge = useCallback(async () => {
    if (!selectedEdgeId || readOnly) return
    try {
      await deleteEdge(selectedEdgeId)
      setDbEdges((prev) => prev.filter((e) => e.id !== selectedEdgeId))
      setSelectedEdgeId(null)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エッジ削除に失敗しました')
    }
  }, [readOnly, selectedEdgeId])

  const handleEdgeClick = useCallback(
    (_: MouseEvent, edge: Edge) => {
      if (readOnly) return
      setSelectedEdgeId(edge.id)
      setEdgeLabelDraft(typeof edge.label === 'string' ? edge.label : '')
      setSelectedNode(null)
      setLinkSourceId(null)
    },
    [readOnly],
  )

  const saveEdgeLabel = useCallback(async () => {
    if (!selectedEdgeId || readOnly) return
    const label = edgeLabelDraft.trim() || null
    try {
      const updated = await updateEdge(selectedEdgeId, { label })
      setDbEdges((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ラベルの保存に失敗しました')
    }
  }, [readOnly, selectedEdgeId, edgeLabelDraft])

  useEffect(() => {
    if (readOnly || !selectedEdgeId) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const target = e.target as HTMLElement
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
        e.preventDefault()
        void deleteSelectedEdge()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [readOnly, selectedEdgeId, deleteSelectedEdge])

  const handleNodeUpdated = useCallback((updated: PaperNode) => {
    setDbNodes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)))
    setSelectedNode(updated)
  }, [])

  const handleNodeDeleted = useCallback((id: string) => {
    setDbNodes((prev) => prev.filter((n) => n.id !== id))
    setDbEdges((prev) =>
      prev.filter((e) => e.source_node_id !== id && e.target_node_id !== id),
    )
    setSelectedNode(null)
    setLinkSourceId(null)
  }, [])

  const handleNodeCreated = useCallback((node: PaperNode) => {
    setDbNodes((prev) => [...prev, node])
  }, [])

  const handleConnectModeChange = useCallback((mode: ConnectMode) => {
    setConnectMode(mode)
    setLinkSourceId(null)
  }, [])

  const connectByName = useCallback(async () => {
    const sourceResult = findNodeByTitle(dbNodes, nameSourceTitle)
    if (sourceResult.error || !sourceResult.node) {
      setError(sourceResult.error ?? '接続元が見つかりません')
      return
    }
    const targetResult = findNodeByTitle(dbNodes, nameTargetTitle)
    if (targetResult.error || !targetResult.node) {
      setError(targetResult.error ?? '接続先が見つかりません')
      return
    }
    await tryCreateEdge(sourceResult.node.id, targetResult.node.id)
    setNameSourceTitle('')
    setNameTargetTitle('')
  }, [dbNodes, nameSourceTitle, nameTargetTitle, tryCreateEdge])

  const nodeTitleListId = 'graph-node-titles'

  const toolbar = useMemo(
    () => (
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
        {!readOnly && (
          <>
            <AddNodeButton userId={userId} onCreated={handleNodeCreated} />
            <div className="flex rounded-lg border border-slate-200 p-0.5 text-sm">
              <button
                type="button"
                onClick={() => handleConnectModeChange('select')}
                className={`rounded-md px-3 py-1.5 ${
                  connectMode === 'select'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                2点選択で結線
              </button>
              <button
                type="button"
                onClick={() => handleConnectModeChange('drag')}
                className={`rounded-md px-3 py-1.5 ${
                  connectMode === 'drag'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                ドラッグで結線
              </button>
              <button
                type="button"
                onClick={() => handleConnectModeChange('name')}
                className={`rounded-md px-3 py-1.5 ${
                  connectMode === 'name'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                名前で結線
              </button>
            </div>
            {connectMode === 'name' && (
              <form
                className="flex flex-wrap items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  void connectByName()
                }}
              >
                <input
                  value={nameSourceTitle}
                  onChange={(e) => setNameSourceTitle(e.target.value)}
                  placeholder="接続元の論文名"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  list={nodeTitleListId}
                  autoComplete="off"
                />
                <span className="text-sm text-slate-500">→</span>
                <input
                  value={nameTargetTitle}
                  onChange={(e) => setNameTargetTitle(e.target.value)}
                  placeholder="接続先の論文名"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  list={nodeTitleListId}
                  autoComplete="off"
                />
                <datalist id={nodeTitleListId}>
                  {dbNodes.map((node) => (
                    <option key={node.id} value={node.title} />
                  ))}
                </datalist>
                <button
                  type="submit"
                  disabled={!nameSourceTitle.trim() || !nameTargetTitle.trim()}
                  className="rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  接続
                </button>
              </form>
            )}
            {connectMode === 'select' && linkSourceId && (
              <span className="text-xs text-amber-700">
                接続先のノードをクリックしてください
              </span>
            )}
            {connectMode === 'drag' && (
              <span className="text-xs text-slate-500">
                四角の辺の中点からドラッグして接続
              </span>
            )}
            {connectMode === 'name' && (
              <span className="text-xs text-slate-500">
                論文名を入力するか、候補から選んで接続
              </span>
            )}
            {!readOnly && (
              <span className="text-xs text-slate-500">
                線をクリックで選択 → 削除（Delete キー可）
              </span>
            )}
            {selectedEdgeId && !readOnly && (
              <>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span>関係ラベル:</span>
                  <input
                    value={edgeLabelDraft}
                    onChange={(e) => setEdgeLabelDraft(e.target.value)}
                    placeholder="extends, improves..."
                    className="rounded border border-slate-300 px-2 py-1 text-xs"
                    list="edge-label-presets"
                  />
                  <datalist id="edge-label-presets">
                    <option value="extends" />
                    <option value="improves" />
                    <option value="prerequisite" />
                  </datalist>
                  <button
                    type="button"
                    onClick={() => void saveEdgeLabel()}
                    className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
                  >
                    保存
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => void deleteSelectedEdge()}
                  className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                >
                  選択中の線を削除
                </button>
              </>
            )}
          </>
        )}
        <label
          className="flex items-center gap-2 text-sm text-slate-600"
          title="「研究テーマとの関連」が関連のノードだけを表示します"
        >
          <input
            type="checkbox"
            checked={relevantOnly}
            onChange={(e) => setRelevantOnly(e.target.checked)}
          />
          関連ノードのみ表示
        </label>
        {readOnly && (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
            閲覧のみ
          </span>
        )}
      </div>
    ),
    [
      readOnly,
      relevantOnly,
      userId,
      handleNodeCreated,
      connectMode,
      linkSourceId,
      handleConnectModeChange,
      nameSourceTitle,
      nameTargetTitle,
      connectByName,
      nodeTitleListId,
      dbNodes,
      selectedEdgeId,
      deleteSelectedEdge,
      edgeLabelDraft,
      saveEdgeLabel,
    ],
  )

  if (loading) {
    return <div className="py-12 text-center text-slate-500">グラフを読み込み中...</div>
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {toolbar}
      {error && (
        <div className="bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
      )}
      <div className="relative min-h-0 flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={readOnly ? undefined : onNodesChange}
          onEdgesChange={readOnly ? undefined : onEdgesChange}
          onConnect={onConnect}
          onNodeDragStop={onNodeDragStop}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onEdgeClick={handleEdgeClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={{ type: 'midpoint' }}
          nodesDraggable={!readOnly}
          nodesConnectable={!readOnly && connectMode === 'drag'}
          elementsSelectable
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
      {activeNode && (
        <NodeDetailPanel
          node={activeNode}
          userId={userId}
          memoUserId={ownerId}
          readOnly={readOnly}
          onUpdated={handleNodeUpdated}
          onDeleted={handleNodeDeleted}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </div>
  )
}

function AddNodeButton({
  userId,
  onCreated,
}: {
  userId: string
  onCreated: (node: PaperNode) => void
}) {
  const [title, setTitle] = useState('')
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)
    try {
      const node = await createNode(userId, {
        title: title.trim(),
        position_x: 100 + Math.random() * 200,
        position_y: 100 + Math.random() * 200,
      })
      onCreated(node)
      setTitle('')
      setOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        + ノード追加
      </button>
    )
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="flex items-center gap-2">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="論文名 / 手法名"
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        autoFocus
      />
      <button
        type="submit"
        disabled={submitting || !title.trim()}
        className="rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        追加
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="text-sm text-slate-500 hover:text-slate-700"
      >
        キャンセル
      </button>
    </form>
  )
}
