import { chip, paint, rank, state, urgent } from '../../theme/theme.ts'

import { PRIORITY, type Priority, type Status } from './model.ts'

/**
 * The board's words, mapped onto the theme's roles.
 *
 * No colour is chosen here. `src/theme` owns every value in the product; this
 * file owns only the fact that a column the board calls `progress` is the
 * workflow state the theme calls `doing` — board vocabulary, and it belongs
 * with the board.
 *
 * A label is a word: nothing about "Design" implies a hue. So a tag is hashed
 * onto the theme's closed ring, which keeps a tag the same colour everywhere
 * without a table anybody maintains. Priority is the exception and overrides
 * it, because it is ordered.
 */

/** The platform's ranking, in the board's words. */
const RANK: Record<Priority, number> = { urgent: 1, high: 2, medium: 3, low: 4 }

/** The fill behind a chip. Its ink comes back with it — never chosen at the call site. */
export const tone = (label: string, priority?: Priority) =>
  priority && label.toLowerCase() === priority ? rank(RANK[priority]) : chip(label)

/** Whether a priority is the tier that carries the alert hue. */
export const loud = (priority: Priority) => urgent(RANK[priority])

/** The dot beside a column name. Ordered, so these are named rather than hashed. */
export const dot: Record<Status, string> = {
  backlog: state.backlog,
  todo: state.todo,
  progress: state.doing,
  done: state.done,
}

/** The estimate ring: our accent on the one hairline. */
export const ring = { arc: paint.accent, track: paint.rule } as const

/** Every priority the board knows, ranked. Re-stated nowhere else. */
export const priorities = PRIORITY
