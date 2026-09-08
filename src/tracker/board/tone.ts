import type { Priority, Status } from './model.ts'

/**
 * Colour for things that have no colour of their own.
 *
 * A label is a word; nothing about "Design" implies a hue. So a tag never
 * carries one — it is hashed onto a fixed ring of slots, which keeps a tag the
 * same colour everywhere without a table anyone has to maintain, and keeps the
 * palette closed no matter how many tags exist.
 *
 * Priority is the exception and overrides the ring: it is ordered, so it reads
 * as rank rather than as category. The reference draws Low and Medium alike and
 * separates only High and Urgent — colour there answers "is this urgent", and
 * the three levels are carried by the word.
 *
 * Values are token references. `tone.css` is the one place they are defined.
 */

/** The categorical ring. Five slots, closed. */
const SLOTS = 5

const slot = (name: string): string => {
  let h = 0
  for (const ch of name.toLowerCase()) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return `var(--tone-${h % SLOTS})`
}

const RANK: Record<Priority, string> = {
  low: 'var(--tone-calm)',
  medium: 'var(--tone-calm)',
  high: 'var(--tone-warn)',
  urgent: 'var(--tone-warn)',
}

/** The fill behind a chip. Ink on every chip is `var(--tone-ink)`. */
export const tone = (label: string, priority?: Priority): string =>
  priority && label.toLowerCase() === priority ? RANK[priority] : slot(label)

/** The dot beside a column name. Ordered, so these are named rather than hashed. */
export const dot: Record<Status, string> = {
  backlog: 'var(--status-backlog)',
  todo: 'var(--status-todo)',
  progress: 'var(--status-progress)',
  done: 'var(--status-done)',
}
