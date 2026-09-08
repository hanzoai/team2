/**
 * EVERY ADDRESS THIS CLIENT ANSWERS, and the only module that knows both a
 * navigator and a view.
 *
 * The shell is composed HERE rather than inside each surface, so a surface
 * cannot forget it and no two surfaces can draw it differently — one rail, one
 * navigator column, one aside, whatever screen is showing. A surface component
 * renders only its own region.
 *
 * The rail's list lives in `~/shell/surfaces`, and the paths below are that
 * table's. A surface reachable from the rail and missing here is a glyph that
 * goes nowhere, which is exactly what one declaration prevents.
 *
 * `/issues` is Kanban's own address as well as the tracker's root, so the
 * default view has one address and not two. The splat ranks last and catches
 * every address this product ever answered and no longer does, so a stale
 * bookmark is a redirect rather than the router's own error page.
 */
import { EmptyState } from '@hanzo/ui/product'
import { SquareCheck } from '@hanzogui/lucide-icons-2'
import type { ReactNode } from 'react'
import type { RouteObject } from 'react-router'
import { Navigate, useParams } from 'react-router'

import { Chat } from '~/chat'
import { Inbox } from '~/inbox'
import { Nav } from '~/nav'
import { Shell } from '~/shell'
import { Tracker } from '~/tracker'

/** A screen this build has not written. It says which one and what belongs on
 *  it, because a blank screen and an unfinished one look identical and only one
 *  of them is honest. */
const soon = (title: string, what: string) => (
  <EmptyState icon={SquareCheck} title={title} description={`${what} Not built yet.`} />
)

/** A project's page, named from the address so the screen is about the thing you
 *  clicked rather than about the router. */
const Page = () => {
  const { page } = useParams()
  const name = page ? page[0].toUpperCase() + page.slice(1) : 'This page'
  return soon(name, `${name} for one project.`)
}

const tracker = (view: ReactNode) => (
  <Shell nav={<Nav />} aside={<Inbox />}>
    {view}
  </Shell>
)

export const routes: RouteObject[] = [
  { path: '/', element: <Navigate to="/issues" replace /> },

  { path: '/issues', element: tracker(<Tracker />) },
  { path: '/issues/:view', element: tracker(<Tracker />) },
  { path: '/mine', element: tracker(soon('My issues', 'Everything assigned to you, across every project.')) },
  { path: '/projects', element: tracker(soon('All projects', 'The projects you are in, and the ones you could join.')) },
  { path: '/projects/:id/:page', element: tracker(<Page />) },

  { path: '/chat', element: <Shell nav={null}><Chat /></Shell> },
  { path: '/chat/:id', element: <Shell nav={null}><Chat /></Shell> },

  { path: '/calendar', element: <Shell nav={null}>{soon('Calendar', 'Meetings, deadlines and the week beside the work.')}</Shell> },
  { path: '/time', element: <Shell nav={null}>{soon('Time', 'What the work took, against what it was estimated at.')}</Shell> },
  { path: '/meet', element: <Shell nav={null}>{soon('Meet', 'Calls and huddles, from the room you are already in.')}</Shell> },

  { path: '*', element: <Navigate to="/issues" replace /> },
]
