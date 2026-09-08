import { BrowserRouter, useRoutes } from 'react-router'
import { Hanzo, TooltipProvider } from '@hanzo/ui'
import { Session } from '~/data/session.tsx'
import { Space } from '~/data/space.tsx'
import { routes } from '~/routes'
import { Serve } from '~/serve'

const Routed = () => useRoutes(routes)

/**
 * `Hanzo` carries the stylesheet and the theme context, so it wraps the router
 * rather than sitting inside a route: a theme that mounts per route re-mounts
 * every provider under it on every navigation. The same argument puts `Session`
 * and `Space` here — who this browser is, and which org and space they are
 * acting in, are settled once per visit and not once per screen. `Serve` hands
 * each region its backend and renders nothing.
 */
const HINT = 200

export const App = () => (
  <Hanzo>
    <TooltipProvider delay={HINT}>
      <Session>
        <Space>
          <Serve />
          <BrowserRouter>
            <Routed />
          </BrowserRouter>
        </Space>
      </Session>
    </TooltipProvider>
  </Hanzo>
)
