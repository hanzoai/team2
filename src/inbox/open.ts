/**
 * Whether the Inbox is showing, and the answer survives a reload.
 *
 * It lives here rather than in the shell because dismissing is the panel's own
 * affordance — the shell only knows that `aside` absent means the main region
 * grows into the space. One boolean, one store, and the rail's bell and the
 * panel's close control read and write the same one.
 *
 * `localStorage` because this is a per-browser convenience and nothing more: it
 * is not worth a round trip, it must not reach another device, and a browser
 * that refuses it (a private window, blocked site data) still has to render —
 * so every touch is wrapped and the default stands when it throws.
 */
import { useSyncExternalStore } from 'react'

const KEY = 'team.inbox.open'

const stored = (): boolean => {
  try {
    return localStorage.getItem(KEY) !== 'no'
  } catch {
    return true
  }
}

let showing = stored()
const listeners = new Set<() => void>()

export const setOpen = (next: boolean) => {
  if (next === showing) return
  showing = next
  try {
    localStorage.setItem(KEY, next ? 'yes' : 'no')
  } catch {
    // A browser that will not remember still has to obey for this session.
  }
  for (const l of listeners) l()
}

export const toggle = () => setOpen(!showing)

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => void listeners.delete(l)
}

/** Whether to render the panel. The shell asks; nothing else needs to. */
export const useOpen = (): boolean =>
  useSyncExternalStore(
    subscribe,
    () => showing,
    () => showing,
  )
