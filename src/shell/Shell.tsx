/**
 * OWNED BY THE FRAME AGENT. Scaffold placeholder: the props below are the seam
 * every region writes against, so replace the body and keep the signature.
 *
 * Four regions, left to right: a fixed icon rail, a fixed navigator, a fluid
 * main panel, and a fixed dismissible aside. Only the main region absorbs a
 * change in width — the reference proves it by clipping its fourth board column
 * rather than reflowing, so main scrolls and the sidebars do not move.
 */
import type { ReactNode } from 'react'
import { XStack, YStack } from '@hanzo/ui'

export type ShellProps = {
  /** The navigator region: a panel title, a search, a list. */
  nav: ReactNode
  /** The main region. Fluid; it is the only part that absorbs a resize. */
  children: ReactNode
  /** The dismissible right panel. Absent means main grows into the space. */
  aside?: ReactNode
}

export const Shell = ({ nav, children, aside }: ShellProps) => (
  <XStack flex={1} bg="$background" gap={8} p={16}>
    <YStack width={83} shrink={0}>{null}</YStack>
    <YStack width={209} shrink={0}>{nav}</YStack>
    <YStack flex={1} minW={0} bg="$panel" rounded={6} overflow="hidden">
      {children}
    </YStack>
    {aside ? (
      <YStack width={307} shrink={0} bg="$panel" rounded={6} overflow="hidden">
        {aside}
      </YStack>
    ) : null}
  </XStack>
)
