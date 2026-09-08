/** OWNED BY THE CHAT AGENT. */
import { SizableText, YStack } from '@hanzo/ui'
import { Shell } from '~/shell'

export const Chat = () => (
  <Shell nav={<SizableText p={16}>Chat</SizableText>}>
    <YStack p={21}>
      <SizableText>Channel</SizableText>
    </YStack>
  </Shell>
)
