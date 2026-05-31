import type { Edge, Node } from '@xyflow/react'
import type { PaperEdge, PaperNode } from '../types'
import { understandingLabel } from './constants'

export type PaperFlowNode = Node<{ node: PaperNode }, 'paper'>

export function toFlowNodes(
  nodes: PaperNode[],
  relevantOnly: boolean,
): PaperFlowNode[] {
  return nodes
    .filter((n) => !relevantOnly || n.is_relevant)
    .map((n) => ({
      id: n.id,
      type: 'paper',
      position: { x: n.position_x, y: n.position_y },
      data: { node: n },
      style: { opacity: n.is_relevant ? 1 : 0.35 },
    }))
}

export function toFlowEdges(edges: PaperEdge[], visibleNodeIds: Set<string>): Edge[] {
  return edges
    .filter(
      (e) =>
        visibleNodeIds.has(e.source_node_id) &&
        visibleNodeIds.has(e.target_node_id),
    )
    .map((e) => ({
      id: e.id,
      source: e.source_node_id,
      target: e.target_node_id,
      label: e.label ?? undefined,
      animated: false,
    }))
}

export function nodeSummary(node: PaperNode): string {
  const parts = [understandingLabel(node.understanding)]
  if (node.year) parts.push(String(node.year))
  return parts.join(' · ')
}
