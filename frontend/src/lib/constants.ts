import type { UnderstandingLevel } from '../types'

export const UNDERSTANDING_OPTIONS: {
  value: UnderstandingLevel
  label: string
  symbol: string
}[] = [
  { value: 'mastered', label: '◎ 完全理解', symbol: '◎' },
  { value: 'good', label: '○ 理解', symbol: '○' },
  { value: 'partial', label: '△ 部分理解', symbol: '△' },
  { value: 'none', label: '× 未理解', symbol: '×' },
  { value: 'unset', label: '未設定', symbol: '—' },
]

export function understandingLabel(level: UnderstandingLevel): string {
  return UNDERSTANDING_OPTIONS.find((o) => o.value === level)?.symbol ?? '—'
}

export function generateInviteCode(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()
}
