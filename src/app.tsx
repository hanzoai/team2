import { BrowserRouter, useRoutes } from 'react-router'
import { Hanzo } from '@hanzo/ui'
import { routes } from '~/routes'

const Routed = () => useRoutes(routes)

/**
 * `Hanzo` carries the stylesheet and the theme context, so it wraps the router
 * rather than sitting inside a route: a theme that mounts per route re-mounts
 * every provider under it on every navigation.
 */
export const App = () => (
  <Hanzo>
    <BrowserRouter>
      <Routed />
    </BrowserRouter>
  </Hanzo>
)
