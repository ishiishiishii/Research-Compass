import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { PaperFlowNodeData } from '../../lib/graph-utils'
import { understandingLabel } from '../../lib/constants'

const SIDES = [
  { position: Position.Top, id: 'top' },
  { position: Position.Right, id: 'right' },
  { position: Position.Bottom, id: 'bottom' },
  { position: Position.Left, id: 'left' },
] as const

export function PaperNodeComponent({ data, selected }: NodeProps) {
  const { node, isLinkSource, showHandles } = data as PaperFlowNodeData

  const handleClass = showHandles
    ? '!h-3 !w-3 !border-2 !border-white !bg-indigo-500'
    : '!h-3 !w-3 !opacity-0'

  return (
    <div
      className={`min-w-[140px] rounded-lg border-2 bg-white px-3 py-2 shadow-sm transition-colors ${
        isLinkSource
          ? 'border-amber-500 ring-2 ring-amber-200'
          : selected
            ? 'border-indigo-500'
            : 'border-slate-300'
      }`}
    >
      {SIDES.map(({ position, id }) => (
        <Handle
          key={`${id}-source`}
          type="source"
          position={position}
          id={`${id}-source`}
          className={handleClass}
        />
      ))}
      {SIDES.map(({ position, id }) => (
        <Handle
          key={`${id}-target`}
          type="target"
          position={position}
          id={`${id}-target`}
          className={handleClass}
        />
      ))}
      <div className="text-sm font-semibold text-slate-900">{node.title}</div>
      <div className="mt-1 text-xs text-slate-500">
        {understandingLabel(node.understanding)}
        {node.year ? ` · ${node.year}` : ''}
      </div>
      {isLinkSource && (
        <div className="mt-1 text-[10px] font-medium text-amber-600">結線の開始点</div>
      )}
    </div>
  )
}
