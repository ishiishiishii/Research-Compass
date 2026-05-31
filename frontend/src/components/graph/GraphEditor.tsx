import { useCallback, useEffect, useMemo, useState, type MouseEvent } from 'react'
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
  updateNode,
} from '../../lib/api/nodes'
import { toFlowEdges, toFlowNodes, type PaperFlowNode } from '../../lib/graph-utils'
import { PaperNodeComponent } from './PaperNode'
import { NodeDetailPanel } from './NodeDetailPanel'

const nodeTypes = { paper: PaperNodeComponent }

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
    () => toFlowNodes(dbNodes, relevantOnly),
    [dbNodes, relevantOnly],
  )
  const visibleIds = useMemo(
    () => new Set(flowNodes.map((n) => n.id)),
    [flowNodes],
  )
  const flowEdges = useMemo(
    () => toFlowEdges(dbEdges, visibleIds),
    [dbEdges, visibleIds],
  )

  useEffect(() => {
    setNodes(flowNodes)
    setEdges(flowEdges)
  }, [flowNodes, flowEdges, setNodes, setEdges])

  const activeNode =
    selectedNode && visibleIds.has(selectedNode.id) ? selectedNode : null

  const onConnect = useCallback(
    async (connection: Connection) => {
      if (readOnly || !connection.source || !connection.target) return
      try {
        const edge = await createEdge(userId, connection.source, connection.target)
        setDbEdges((prev) => [...prev, edge])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エッジ作成に失敗しました')
      }
    },
    [readOnly, userId],
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
      setSelectedNode(paper)
    },
    [],
  )

  const onPaneClick = useCallback(() => setSelectedNode(null), [])

  const handleEdgeClick = useCallback(
    async (_: MouseEvent, edge: Edge) => {
      if (readOnly) return
      if (!confirm('この関係を削除しますか？')) return
      try {
        await deleteEdge(edge.id)
        setDbEdges((prev) => prev.filter((e) => e.id !== edge.id))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エッジ削除に失敗しました')
      }
    },
    [readOnly],
  )

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
  }, [])

  const handleNodeCreated = useCallback((node: PaperNode) => {
    setDbNodes((prev) => [...prev, node])
    setSelectedNode(node)
  }, [])

  const toolbar = useMemo(
    () => (
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
        {!readOnly && (
          <AddNodeButton userId={userId} onCreated={handleNodeCreated} />
        )}
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={relevantOnly}
            onChange={(e) => setRelevantOnly(e.target.checked)}
          />
          関連のみ表示
        </label>
        {readOnly && (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
            閲覧のみ
          </span>
        )}
      </div>
    ),
    [readOnly, relevantOnly, userId, handleNodeCreated],
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
          nodesDraggable={!readOnly}
          nodesConnectable={!readOnly}
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

  async function handleAdd() {
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
    <div className="flex items-center gap-2">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="論文名 / 手法名"
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        autoFocus
      />
      <button
        type="button"
        disabled={submitting}
        onClick={() => void handleAdd()}
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
    </div>
  )
}
