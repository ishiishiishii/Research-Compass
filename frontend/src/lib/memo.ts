import type { MemoContent } from '../types'

export function parseMemoContent(raw: string): MemoContent {
  try {
    const parsed = JSON.parse(raw) as MemoContent
    if (typeof parsed.confusion === 'string' && typeof parsed.note === 'string') {
      return parsed
    }
  } catch {
    // legacy plain text
  }
  return { confusion: '', note: raw }
}

export function serializeMemoContent(content: MemoContent): string {
  return JSON.stringify(content)
}
