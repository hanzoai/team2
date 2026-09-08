/**
 * THE ADDRESS MODEL. Which view is showing is read from the URL and nowhere
 * else, so a reload lands on the screen it left and a link is a screen.
 *
 * The board draws the tab row; this decides what a tab means. That split is the
 * whole interface: the board never parses a path and the shell never paints a
 * tab.
 */
import { CalendarRange, Kanban, List } from '@hanzogui/lucide-icons-2'
import type { ComponentType } from 'react'
import { useLocation } from 'react-router'

/** The three ways a project's issues are drawn, in the order the tab row draws
 *  them. A view is a place, so it is a segment and not a piece of state. */
export const VIEWS = [
  { id: 'kanban', label: 'Kanban', icon: Kanban },
  { id: 'list', label: 'List', icon: List },
  { id: 'timeline', label: 'Timeline', icon: CalendarRange },
] as const satisfies readonly { id: string; label: string; icon: ComponentType<never> }[]

export type View = (typeof VIEWS)[number]['id']

export const isView = (s: string | undefined): s is View => VIEWS.some((v) => v.id === s)

/** Where a view lives. `/issues` is Kanban's own address as well as the
 *  tracker's root, so the default view has one address rather than two. */
export const viewPath = (view: View): string =>
  view === 'kanban' ? '/issues' : `/issues/${view}`

/** Which view is showing. Kanban when the address does not say. */
export const useView = (): View => {
  const segment = useLocation().pathname.split('/')[2]
  return isView(segment) ? segment : 'kanban'
}
