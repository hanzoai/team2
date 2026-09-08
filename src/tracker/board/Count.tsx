import type { ReactNode } from 'react'
import { SizableText, XStack } from '@hanzo/ui'

/**
 * A glyph and a number. Attachments, replies, members — the same pair each
 * time, so it is one component rather than three spellings of a row.
 *
 * Nothing renders at zero. The reference draws cards with one count, both
 * counts and neither, and an explicit "0" would be the target explaining its
 * own data model on the face of a card.
 */
export const Count = ({ glyph, n, label }: { glyph: ReactNode; n: number; label: string }) =>
  n > 0 ? (
    <XStack items="center" gap={4} aria-label={`${n} ${label}`}>
      {glyph}
      <SizableText fontSize="$3" color="$dim">
        {n}
      </SizableText>
    </XStack>
  ) : null
