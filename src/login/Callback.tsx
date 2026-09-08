import { useEffect, useState } from 'react'
import { SizableText, Spinner, YStack } from '@hanzo/ui'

import { useSession } from '~/data/session.tsx'
import { gap, paint, rung } from '~/theme/theme.ts'

/**
 * Where the issuer returns a browser that signed in the other way.
 *
 * It renders before this browser knows who it is, which is why it is a route
 * of its own: `<Session>` stands down on this path so the ordinary signed-out
 * path does not navigate away from a code that is being redeemed.
 *
 * The landing is a full page navigation rather than a router push, because the
 * URL still carries `code` and `state` — leaving them in the address bar means
 * a reload replays a code the issuer has already spent, which fails and reads
 * as a broken sign-in.
 */
export const Callback = () => {
  const { land } = useSession()
  const [refusal, setRefusal] = useState<string | null>(null)

  useEffect(() => {
    void land()
      .then((where) => window.location.replace(where))
      .catch((e: unknown) => setRefusal(e instanceof Error ? e.message : String(e)))
  }, [land])

  return (
    <YStack flex={1} items="center" justify="center" gap={gap.inset} bg={paint.ground}>
      {refusal ? (
        <>
          <SizableText size={rung.body} color={paint.alert}>
            {refusal}
          </SizableText>
          <SizableText
            size={rung.small}
            color={paint.mute}
            onPress={() => window.location.replace('/login')}
          >
            Try again
          </SizableText>
        </>
      ) : (
        <Spinner />
      )}
    </YStack>
  )
}
