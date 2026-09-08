import { STATUS, type Column, type Issue, type Status, NAME } from './model.ts'

/**
 * Grouping and moving, as pure functions over a flat list.
 *
 * The board holds one array of issues and derives its columns, rather than
 * holding columns and reconciling them. A move is then a status change plus a
 * position, which is exactly what the write path sends — so the optimistic
 * result and the durable result are computed by the same function and cannot
 * drift apart.
 */

/** Every column, in `STATUS` order, including the ones with nothing in them. */
export const columns = (issues: Issue[]): Column[] =>
  STATUS.map((status) => ({
    status,
    name: NAME[status],
    issues: issues.filter((i) => i.status === status),
  }))

/**
 * `id` to `to`, landing before `before` (or last). Returns the same array when
 * the move is a no-op, so a render can be skipped by identity.
 *
 * Order is global rather than per column: an issue keeps its neighbours when it
 * changes status, which is what makes a drag land where it was dropped instead
 * of at the end of the target column.
 */
export const move = (issues: Issue[], id: string, to: Status, before?: string): Issue[] => {
  const from = issues.find((i) => i.id === id)
  if (!from) return issues
  if (from.status === to && before === undefined && last(issues, to)?.id === id) return issues
  if (id === before) return issues

  const rest = issues.filter((i) => i.id !== id)
  const moved = { ...from, status: to }
  const at = before ? rest.findIndex((i) => i.id === before) : -1
  if (at < 0) {
    // After the last issue already in `to` — or at the end when `to` is empty,
    // where `lastIndexOf` answers -1 and index 0 would put it in front of the
    // whole board instead.
    const tail = rest.map((i) => i.status === to).lastIndexOf(true)
    return insert(rest, tail < 0 ? rest.length : tail + 1, moved)
  }
  return insert(rest, at, moved)
}

const insert = (list: Issue[], at: number, item: Issue): Issue[] => [
  ...list.slice(0, at),
  item,
  ...list.slice(at),
]

const last = (issues: Issue[], status: Status): Issue | undefined =>
  issues.filter((i) => i.status === status).at(-1)
