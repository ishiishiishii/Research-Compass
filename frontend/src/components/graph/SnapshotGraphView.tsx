import { useMemo } from 'react'
import { Background, ReactFlow } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import type { PaperEdge, PaperNode } from '../../types'
import { toFlowEdges, toFlowNodes } from '../../lib/graph-utils'
import { MidpointEdge } from './MidpointEdge'
import { PaperNodeComponent } from './PaperNode'

const nodeTypes = { paper: PaperNodeComponent }
const edgeTypes = { midpoint: MidpointEdge }

type SnapshotGraphViewProps = {
  nodes: PaperNode[]
  edges: PaperEdge[]
  height?: number | string
  className?: string
}

export function SnapshotGraphView({
  nodes,
  edges,
  height = 260,
  className = '',
}: SnapshotGraphViewProps) {
  const flowNodes = useMemo(() => toFlowNodes(nodes, false), [nodes])
  const visibleIds = useMemo(() => new Set(flowNodes.map((n) => n.id)), [flowNodes])
  const flowEdges = useMemo(() => toFlowEdges(edges, visibleIds), [edges, visibleIds])

  if (nodes.length === 0) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-400 ${className}`}
        style={{ height }}
      >
        グラフが空です
      </div>
    )
  }

  return (
    <div
      className={`overflow-hidden rounded-lg border border-slate-200 bg-white ${className}`}
      style={{ height }}
    >
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{ type: 'midpoint' }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag
        zoomOnScroll
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={16} size={1} />
      </ReactFlow>
    </div>
  )
}
