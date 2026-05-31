import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { PaperNode } from '../../types'
import { understandingLabel } from '../../lib/constants'

type PaperNodeData = { node: PaperNode }

export function PaperNodeComponent({ data, selected }: NodeProps) {
  const { node } = data as PaperNodeData

  return (
    <div
      className={`min-w-[140px] rounded-lg border-2 bg-white px-3 py-2 shadow-sm ${
        selected ? 'border-indigo-500' : 'border-slate-300'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-slate-400" />
      <div className="text-sm font-semibold text-slate-900">{node.title}</div>
      <div className="mt-1 text-xs text-slate-500">
        {understandingLabel(node.understanding)}
        {node.year ? ` · ${node.year}` : ''}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-slate-400" />
    </div>
  )
}
