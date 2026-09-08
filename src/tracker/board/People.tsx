import { Avatar, AvatarFallback, AvatarImage, SizableText, XStack } from '@hanzo/ui'
import type { Person } from './model.ts'

/**
 * Overlapping faces with a remainder.
 *
 * @hanzo/ui publishes `Avatar` and no grouping of it, so the overlap, the ring
 * that separates one face from the next and the `+N` are here. It is the same
 * component on a card footer and in a board header — only `size` differs —
 * which is why it takes a count of how many to show rather than being written
 * twice.
 *
 * The ring is the ground it sits on, so the component takes that colour rather
 * than assuming one: a face on a card and a face on a panel need different
 * rings to read as separated, and guessing is what makes one of them wrong.
 */
export const People = ({
  people,
  size = 28,
  show = 3,
  ground = '$raised',
}: {
  people: Person[]
  size?: number
  show?: number
  ground?: string
}) => {
  if (people.length === 0) return null
  const seen = people.slice(0, show)
  const rest = people.length - seen.length
  const step = Math.round(size * 0.575)

  return (
    <XStack items="center" aria-label={`${people.length} assigned`}>
      {seen.map((p, i) => (
        <Avatar
          key={p.id}
          size={size}
          ml={i === 0 ? 0 : step - size}
          borderWidth={2}
          borderColor={ground}
          title={p.name}
        >
          {p.face ? <AvatarImage src={p.face} alt="" /> : null}
          <AvatarFallback>{initials(p.name)}</AvatarFallback>
        </Avatar>
      ))}
      {rest > 0 ? (
        <SizableText fontSize="$2" color="$quiet" ml={6}>
          +{rest}
        </SizableText>
      ) : null}
    </XStack>
  )
}

/** First letters of the first two words — never more, so the disc stays legible. */
const initials = (name: string): string =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase()
