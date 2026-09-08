import { Avatar, AvatarFallback, AvatarImage, SizableText, XStack, YStack } from '@hanzo/ui'
import { paint } from '../../theme/theme.ts'
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
 * Two things here have to be OPAQUE, and every surface token is a white
 * overlay. The ring that separates one face from the next: cut from the card's
 * own token it is the colour of the disc beside it. And the disc under a face
 * with no picture: left translucent, the face below shows through it and the
 * letters of both run together. So both come from `--face` and the app ground,
 * carried by a wrapper — the ring is a prop because a face on a light surface
 * needs the other one.
 */
export const People = ({
  people,
  size = 28,
  show = 3,
  ground = paint.ground,
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
        <YStack
          key={p.id}
          ml={i === 0 ? 0 : step - size}
          rounded={9999}
          borderWidth={2}
          style={{ backgroundColor: ground, borderColor: ground }}
        >
          <Avatar size={size} aria-label={p.name}>
            {p.face ? <AvatarImage src={p.face} alt="" /> : null}
            <AvatarFallback>{initial(p.name)}</AvatarFallback>
          </Avatar>
        </YStack>
      ))}
      {rest > 0 ? (
        <SizableText fontSize="$2" color="$quiet" ml={6}>
          +{rest}
        </SizableText>
      ) : null}
    </XStack>
  )
}

/**
 * One letter, because these overlap. A second letter sits in the part of the
 * disc the next face covers, so it is a letter nobody reads — and two of them
 * side by side spell something neither person is called. The whole name is on
 * the element for anything that reads names.
 */
const initial = (name: string): string => (name[0] ?? '').toUpperCase()
