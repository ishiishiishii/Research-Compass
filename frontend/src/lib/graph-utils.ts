import type { Edge, Node } from '@xyflow/react'
import type { PaperEdge, PaperNode } from '../types'
import { understandingLabel } from './constants'

export type PaperFlowNodeData = {
  node: PaperNode
  isLinkSource?: boolean
  showHandles?: boolean
}

export type PaperFlowNode = Node<PaperFlowNodeData, 'paper'>

export function toFlowNodes(
  nodes: PaperNode[],
  relevantOnly: boolean,
  options?: { linkSourceId?: string | null; showHandles?: boolean },
): PaperFlowNode[] {
  const { linkSourceId = null, showHandles = false } = options ?? {}
  return nodes
    .filter((n) => !relevantOnly || n.is_relevant)
    .map((n) => ({
      id: n.id,
      type: 'paper',
      position: { x: n.position_x, y: n.position_y },
      data: {
        node: n,
        isLinkSource: linkSourceId === n.id,
        showHandles,
      },
      style: { opacity: n.is_relevant ? 1 : 0.35 },
    }))
}

export function toFlowEdges(
  edges: PaperEdge[],
  visibleNodeIds: Set<string>,
  selectedEdgeId?: string | null,
): Edge[] {
  return edges
    .filter(
      (e) =>
        visibleNodeIds.has(e.source_node_id) &&
        visibleNodeIds.has(e.target_node_id),
    )
    .map((e) => {
      const selected = e.id === selectedEdgeId
      return {
        id: e.id,
        type: 'midpoint',
        source: e.source_node_id,
        target: e.target_node_id,
        label: e.label ?? undefined,
        animated: false,
        selected,
        style: {
          stroke: selected ? '#ef4444' : '#64748b',
          strokeWidth: selected ? 3 : 2,
        },
      }
    })
}

export function nodeSummary(node: PaperNode): string {
  const parts = [understandingLabel(node.understanding)]
  if (node.year) parts.push(String(node.year))
  return parts.join(' · ')
}

export function edgeExists(
  edges: PaperEdge[],
  sourceId: string,
  targetId: string,
): boolean {
  return edges.some(
    (e) => e.source_node_id === sourceId && e.target_node_id === targetId,
  )
}

export function findNodeByTitle(
  nodes: PaperNode[],
  title: string,
): { node?: PaperNode; error?: string } {
  const normalized = title.trim().toLowerCase()
  if (!normalized) {
    return { error: '論文名を入力してください' }
  }
  const matches = nodes.filter((n) => n.title.trim().toLowerCase() === normalized)
  if (matches.length === 0) {
    return { error: `「${title.trim()}」が見つかりません` }
  }
  if (matches.length > 1) {
    return { error: '同じ名前の論文が複数あります。名前を区別してください' }
  }
  return { node: matches[0] }
}
