import { Spinner, YStack } from '@hanzo/ui'
import type { ReactNode } from 'react'

import { fixture } from '~/data/fixture.ts'
import { useSession } from '~/data/session.tsx'
import { paint } from '~/theme/theme.ts'

import { Callback } from './Callback.tsx'
import { Login } from './Login.tsx'

/** Where the issuer returns a browser. Registered at IAM, so it is fixed. */
const CALLBACK = '/auth/callback'

/**
 * The door, and there is one.
 *
 * A product that reads a person's own work cannot be entered by a stranger, so
 * the whole tree sits behind this rather than each screen checking for itself —
 * a check per screen is a check a new screen forgets, and the screen it forgets
 * on is the one that renders somebody else's board.
 *
 * It is not a route. The callback address is answered HERE, above the router,
 * because it renders while this browser still has no identity and every route
 * below expects one; and `unknown` renders neither door, because a flash of the
 * sign-in screen in front of somebody who is already signed in is worse than a
 * moment of nothing.
 *
 * `?state=` opens it, because a fixture stands in for the whole plane and a
 * session is part of the plane. That is what makes a deterministic capture of
 * any screen possible without a credential — and it is the SAME knob, not a
 * second one: a build that could be entered another way would be a way in.
 */
export const Doorway = ({ children }: { children: ReactNode }) => {
  const { standing } = useSession()

  if (window.location.pathname === CALLBACK) return <Callback />
  if (standing === 'in' || fixture.on) return <>{children}</>
  if (standing === 'out') return <Login />

  return (
    <YStack flex={1} items="center" justify="center" bg={paint.ground}>
      <Spinner />
    </YStack>
  )
}
