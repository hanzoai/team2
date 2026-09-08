/**
 * One notification.
 *
 * Every number here is image-derived from the reference at 2048×1138 and
 * divided by 1.5, the scale the whole port shares; the image px stay in the
 * comments so a later measurement can check the arithmetic instead of repeating
 * it. Where the reference states a rhythm the 4px ramp does not carry, the
 * measured value stands.
 *
 * The dot lane is REAL SPACE rather than an overlay, and that is measured, not
 * assumed: read rows wrap at the same width as unread ones, so the text column
 * is 214 whether a dot is drawn in it or not. Overlaying the dot would have let
 * a read row run 17px wider, and the two would have wrapped differently.
 */
import { Avatar, AvatarFallback, AvatarImage, RelativeTime, SizableText, XStack, YStack } from '@hanzo/ui'

import { chip, gap, paint, ring, round, rung } from '~/theme/theme'
import type { Note, Span } from './note.ts'

/** avatar ⌀52img · line pitch 32img · dot ⌀13img · meta 40img below line 2 */
const FACE = 36
const LEAD = 21
const DOT = 9
const META = 18

/** Initials, and never three of them. */
const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase()

/**
 * The sentence.
 *
 * One text host with the runs nested inside it, so the whole thing wraps as
 * prose. A row of sibling blocks would only ever break at a block boundary,
 * which is how "Elizabeth Reynolds" ends up alone on a line above its verb.
 */
const Line = ({ spans }: { spans: readonly Span[] }) => (
  <SizableText size={rung.body} lineHeight={LEAD} color={paint.mute}>
    {spans.map((s, i) => (
      <SizableText
        key={i}
        size={rung.body}
        lineHeight={LEAD}
        fontWeight={s.strong ? '600' : '400'}
        color={s.mention ? paint.alert : s.strong ? paint.ink : paint.mute}
      >
        {s.text}
      </SizableText>
    ))}
  </SizableText>
)

export type RowProps = {
  note: Note
  /** Reading it clears it. What that means belongs to the feed, not here. */
  onSee: (id: string) => void
}

export const Row = ({ note, onSee }: RowProps) => (
  <XStack
    role="button"
    tabIndex={0}
    aria-label={note.line.map((s) => s.text).join('')}
    onPress={() => onSee(note.id)}
    cursor="pointer"
    px={gap.wide}
    py={gap.inset}
    gap={gap.tight}
    // An unread row is an OBJECT on the sheet — the rung a card sits on. That
    // is the whole of this design's grammar for "this is a thing", and the dot
    // alone would not carry it.
    bg={note.seen ? 'transparent' : paint.card}
    // Full-bleed, ignoring the panel's own padding: measured edge to edge,
    // 1568..2027 of a 1568..2027 panel. The board's card divider does the same,
    // so it is the product's rule rather than this panel's exception.
    borderBottomWidth={1}
    borderColor={paint.rule}
    // Ours by design. The capture is one frame and shows no hover, no focus
    // ring and no pressed state anywhere on the screen.
    hoverStyle={{ background: paint.card }}
    focusVisibleStyle={ring}
  >
    <Avatar size={FACE}>
      {note.actor.face ? <AvatarImage src={note.actor.face} alt="" /> : null}
      {/* The categorical ramp, keyed by the name, so one person keeps one
          colour everywhere and nobody writes a per-person table. */}
      <AvatarFallback bg={chip(note.actor.name).background}>
        <SizableText size={rung.small} fontWeight="600" color={chip(note.actor.name).color}>
          {initials(note.actor.name)}
        </SizableText>
      </AvatarFallback>
    </Avatar>

    <YStack flex={1} minW={0} gap={gap.tight}>
      <YStack>
        <Line spans={note.line} />
        {note.quote ? <Line spans={note.quote} /> : null}
      </YStack>

      {/* elapsed · place. One line, never two: it is the quietest thing in the
          row, and a wrapped one would out-measure the sentence above it.

          RelativeTime keeps its own clock and re-renders only itself, so an
          open panel stays honest without the list re-rendering. It types its
          props as `<time>`'s, so the type role comes from the text host around
          it and `inherit` is what carries it down. */}
      <XStack items="center" gap={gap.tight} overflow="hidden">
        <SizableText size={rung.small} lineHeight={META} color={paint.dim}>
          <RelativeTime
            date={new Date(note.at)}
            style={{ fontSize: 'inherit', lineHeight: 'inherit', color: 'inherit', whiteSpace: 'nowrap' }}
          />
        </SizableText>
        <SizableText size={rung.small} lineHeight={META} color={paint.dim}>
          •
        </SizableText>
        <SizableText size={rung.small} lineHeight={META} color={paint.dim} numberOfLines={1}>
          {note.place}
        </SizableText>
      </XStack>
    </YStack>

    {/* The lane. It holds its width whether or not it draws the dot. */}
    <YStack width={DOT} shrink={0} pt={(LEAD - DOT) / 2}>
      {note.seen ? null : (
        <YStack
          role="img"
          aria-label="unread"
          width={DOT}
          height={DOT}
          rounded={round.pill}
          // The alert hue, not the accent. Our accent IS the product's ink, so
          // an accent dot would be a white mark beside white emphasised names
          // and would stop reading as a mark. The hue is the estate's token for
          // "addressed to you", which is what every row in your own inbox is.
          bg={paint.alert}
        />
      )}
    </YStack>
  </XStack>
)
