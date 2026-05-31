import { BaseEdge, getStraightPath, useInternalNode, type EdgeProps } from '@xyflow/react'

type Side = 'top' | 'right' | 'bottom' | 'left'

const DEFAULT_WIDTH = 140
const DEFAULT_HEIGHT = 64

function getBounds(node: NonNullable<ReturnType<typeof useInternalNode>>) {
  const w = node.measured?.width ?? DEFAULT_WIDTH
  const h = node.measured?.height ?? DEFAULT_HEIGHT
  const x = node.internals.positionAbsolute.x
  const y = node.internals.positionAbsolute.y
  return { x, y, w, h, cx: x + w / 2, cy: y + h / 2 }
}

function pickSides(
  source: NonNullable<ReturnType<typeof useInternalNode>>,
  target: NonNullable<ReturnType<typeof useInternalNode>>,
): { sourceSide: Side; targetSide: Side } {
  const s = getBounds(source)
  const t = getBounds(target)
  const dx = t.cx - s.cx
  const dy = t.cy - s.cy

  if (Math.abs(dx) >= Math.abs(dy)) {
    if (dx >= 0) return { sourceSide: 'right', targetSide: 'left' }
    return { sourceSide: 'left', targetSide: 'right' }
  }
  if (dy >= 0) return { sourceSide: 'bottom', targetSide: 'top' }
  return { sourceSide: 'top', targetSide: 'bottom' }
}

function sidePoint(
  bounds: ReturnType<typeof getBounds>,
  side: Side,
): [number, number] {
  switch (side) {
    case 'top':
      return [bounds.cx, bounds.y]
    case 'right':
      return [bounds.x + bounds.w, bounds.cy]
    case 'bottom':
      return [bounds.cx, bounds.y + bounds.h]
    case 'left':
      return [bounds.x, bounds.cy]
  }
}

export function MidpointEdge({
  id,
  source,
  target,
  style,
  markerEnd,
  interactionWidth,
  selected,
}: EdgeProps) {
  const sourceNode = useInternalNode(source)
  const targetNode = useInternalNode(target)

  if (!sourceNode || !targetNode) return null

  const { sourceSide, targetSide } = pickSides(sourceNode, targetNode)
  const [sourceX, sourceY] = sidePoint(getBounds(sourceNode), sourceSide)
  const [targetX, targetY] = sidePoint(getBounds(targetNode), targetSide)

  const [edgePath] = getStraightPath({ sourceX, sourceY, targetX, targetY })

  const edgeStyle = {
    ...style,
    stroke: selected ? '#ef4444' : (style?.stroke ?? '#64748b'),
    strokeWidth: selected ? 3 : (style?.strokeWidth ?? 2),
  }

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={edgeStyle}
      markerEnd={markerEnd}
      interactionWidth={interactionWidth ?? 24}
    />
  )
}
