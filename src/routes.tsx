import type { RouteObject } from 'react-router'
import { Navigate } from 'react-router'
import { Chat } from '~/chat'
import { Tracker } from '~/tracker'

/**
 * The only module that knows both a navigator and a view. Everything else in
 * the tree knows one region, which is what keeps the regions independent.
 */
export const routes: RouteObject[] = [
  { path: '/', element: <Navigate to="/issues" replace /> },
  { path: '/issues/*', element: <Tracker /> },
  { path: '/chat', element: <Chat /> },
  { path: '/chat/:id', element: <Chat /> },
  { path: '*', element: <Navigate to="/issues" replace /> },
]
