/**
 * The read cache, and it is about sixty lines.
 *
 * `useSyncExternalStore` over a module-scope map: one subscription mechanism,
 * no provider to mount, and `invalidate()` reachable from anywhere — including
 * the callback route, which has to re-read the world the moment a browser stops
 * being anonymous.
 *
 * Every read answers a PHASE, never `data ?? []`. A screen that renders rows
 * from an empty array looks identical whether the space has no issues, the
 * socket has not answered yet, or the call failed — and a port scored from
 * whichever of those happened to render is a port scored from nothing. Three
 * phases here; a caller distinguishes empty from populated by looking at the
 * data, which is the only place that distinction is real.
 */
import { useCallback, useSyncExternalStore } from 'react'

export type Phase = 'loading' | 'ready' | 'failure'

export type Read<T> = {
  phase: Phase
  data: T | undefined
  error: Error | undefined
  reload: () => void
}

type Cell = { phase: Phase; data?: unknown; error?: Error; started: boolean }

const cells = new Map<string, Cell>()
const listeners = new Set<() => void>()
/** Bumped on every change, so a snapshot is a number and never a fresh object. */
let version = 0

const announce = () => {
  version++
  for (const l of listeners) l()
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => void listeners.delete(l)
}

const cell = (key: string): Cell => {
  let c = cells.get(key)
  if (!c) {
    c = { phase: 'loading', started: false }
    cells.set(key, c)
  }
  return c
}

const run = <T>(key: string, load: () => Promise<T>) => {
  const c = cell(key)
  c.started = true
  void load().then(
    (data) => {
      cells.set(key, { phase: 'ready', data, started: true })
      announce()
    },
    (error: unknown) => {
      cells.set(key, { phase: 'failure', error: asError(error), started: true })
      announce()
    },
  )
}

const asError = (e: unknown): Error => (e instanceof Error ? e : new Error(String(e)))

/**
 * Read something once and keep it.
 *
 * `enabled` false holds the read at `loading` rather than answering an empty
 * value — a screen waiting on a session has not failed and is not empty, and
 * saying either would be a lie the screen then paints.
 */
export const useRead = <T>(
  key: string,
  load: () => Promise<T>,
  opts: { enabled?: boolean } = {},
): Read<T> => {
  const enabled = opts.enabled ?? true
  useSyncExternalStore(
    subscribe,
    () => version,
    () => version,
  )

  const c = cell(key)
  if (enabled && !c.started) run(key, load)

  const reload = useCallback(() => {
    cells.delete(key)
    run(key, load)
    announce()
    // `load` is rebuilt every render by design — a closure over the arguments —
    // so it cannot be a dependency without rebuilding this on every render too.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return { phase: c.phase, data: c.data as T | undefined, error: c.error, reload }
}

/**
 * Forget what is held, so the next render re-reads.
 *
 * A prefix drops one family — `invalidate('issue:')` after a card moves — and
 * no argument drops everything, which is what adopting or losing a session
 * means: every read that fired before this browser knew who it was was read as
 * somebody else.
 */
export const invalidate = (prefix?: string) => {
  if (!prefix) cells.clear()
  else for (const key of [...cells.keys()]) if (key.startsWith(prefix)) cells.delete(key)
  announce()
}

/** Put a value in without reading it — how a push updates what is already held. */
export const hold = <T>(key: string, data: T) => {
  cells.set(key, { phase: 'ready', data, started: true })
  announce()
}

/** What is held, for a writer that needs to patch it. Undefined when nothing is. */
export const held = <T>(key: string): T | undefined => cells.get(key)?.data as T | undefined
