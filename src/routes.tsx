import type { RouteObject } from 'react-router'
import { Navigate } from 'react-router'
import { Chat } from '~/chat'
import { Callback } from '~/login/Callback.tsx'
import { Login } from '~/login/Login.tsx'
import { Tracker } from '~/tracker'

/**
 * The only module that knows both a navigator and a view. Everything else in
 * the tree knows one region, which is what keeps the regions independent.
 *
 * `/auth/callback` is the issuer's return trip and is a route of its own
 * rather than a branch inside a screen, because it renders before this browser
 * knows who it is.
 */
export const routes: RouteObject[] = [
  { path: '/', element: <Navigate to="/issues" replace /> },
  { path: '/login', element: <Login /> },
  { path: '/auth/callback', element: <Callback /> },
  { path: '/issues/*', element: <Tracker /> },
  { path: '/chat', element: <Chat /> },
  { path: '/chat/:id', element: <Chat /> },
  { path: '*', element: <Navigate to="/issues" replace /> },
]
