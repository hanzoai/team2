/**
 * The two numbers the rail draws and does not own.
 *
 * How many notices are waiting is a fact about the aside's contents; how much of
 * the work is left is a fact about the tracker. Both are painted on the rail,
 * which belongs to neither. Rather than have three regions import each other,
 * whoever knows the number states it here and the rail reads it — so the rail
 * has no data imports and neither writer knows the rail exists.
 *
 * `useSyncExternalStore` rather than a context: the writers are not under a
 * provider and there is nothing here to mount.
 */
import { useSyncExternalStore } from 'react'

const tell = <T,>(initial: T) => {
  let held = initial
  const readers = new Set<() => void>()
  return {
    set: (next: T) => {
      if (next === held) return
      held = next
      for (const r of readers) r()
    },
    use: (): T =>
      useSyncExternalStore(
        (r) => {
          readers.add(r)
          return () => readers.delete(r)
        },
        () => held,
        () => initial,
      ),
  }
}

const notices = tell(0)
const todo = tell<number | null>(null)

/** How many notices are unread. */
export const setNotices = notices.set
export const useNotices = notices.use

/** What share of the work is still to do, 0–100. `null` is nothing to say, and
 *  the gauge draws an em-dash rather than a zero. */
export const setTodo = todo.set
export const useTodo = todo.use
