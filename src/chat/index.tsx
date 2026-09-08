/** OWNED BY THE CHAT AGENT. */
import { SizableText, YStack } from '@hanzo/ui'

/**
 * The channel view. `routes.tsx` composes the shell around it and passes the
 * navigator, so this renders its own region and nothing else — a surface that
 * drew its own shell would draw a second rail the moment the route drew one too.
 */
export const Chat = () => (
  <YStack p={21}>
    <SizableText>Channel</SizableText>
  </YStack>
)
