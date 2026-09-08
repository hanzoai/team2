/**
 * THE CHAT NAVIGATOR — the same column the tracker draws, with rooms in it.
 *
 * Every part here comes from `frame/Nav.tsx`: the search field, the hairline,
 * the uppercase group heading, the row. That is the whole point of the seam —
 * a second navigator built out of its own parts would drift from the first one
 * on the day either is touched, and the reference draws ONE column vocabulary
 * for whatever surface is open.
 *
 * Two groups, because the platform stores two classes and they read differently:
 * a channel is a place with a name, a direct message is a person. Nothing else
 * is invented — there is no All-channels row and no Drafts, because neither is
 * a thing this build can open.
 */
import { SizableText, Spinner, YStack } from '@hanzo/ui'
import { Hash, Lock } from '@hanzogui/lucide-icons-2'
import { useState } from 'react'
import { useLocation } from 'react-router'

import { PAD } from '~/shell/measure.ts'
import { Find, Group, Nav as Column, Roll, Row, Rule, surfaceAt } from '~/shell'
import type { Room } from './chat.ts'
import { useRooms } from './read.ts'

export function Channels() {
  const { pathname } = useLocation()
  const [query, setQuery] = useState('')
  const load = useRooms()
  const all = load.data ?? []
  const q = query.trim().toLowerCase()
  const shown = q ? all.filter((r) => r.name.toLowerCase().includes(q)) : all
  const channels = shown.filter((r) => r.kind === 'channel')
  const directs = shown.filter((r) => r.kind === 'direct')

  return (
    <Column title={surfaceAt(pathname)?.label ?? 'Chat'}>
      <Find value={query} onChange={setQuery} />
      <YStack height={24} />
      <Rule />

      <Roll>
        {load.phase === 'loading' ? (
          <YStack px={PAD} py={12}>
            <Spinner size={16} />
          </YStack>
        ) : null}

        {load.phase === 'failure' ? <Note>Your rooms could not be read.</Note> : null}

        {load.phase === 'ready' && all.length === 0 ? (
          <Note>No rooms yet.</Note>
        ) : null}

        {/* A search that matches nothing is not an empty space, and saying so
            with the same words would send somebody looking for a bug. */}
        {load.phase === 'ready' && all.length > 0 && shown.length === 0 ? (
          <Note>Nothing matches “{query.trim()}”.</Note>
        ) : null}

        {channels.length > 0 ? (
          <>
            <Group>Channels</Group>
            {channels.map((r) => (
              <Line key={r.id} room={r} />
            ))}
          </>
        ) : null}

        {directs.length > 0 ? (
          <>
            <Group>Direct</Group>
            {directs.map((r) => (
              <Line key={r.id} room={r} />
            ))}
          </>
        ) : null}
      </Roll>
    </Column>
  )
}

/**
 * One room.
 *
 * The glyph says what KIND of room it is and nothing else: `#` for a channel a
 * person can join, a lock for one they cannot. A direct message keeps the `#`
 * off entirely — it is a person, and a hash in front of a name reads as a
 * channel called that.
 */
const Line = ({ room }: { room: Room }) => (
  <Row to={`/chat/${room.id}`} icon={<Glyph room={room} />}>
    {room.name}
  </Row>
)

const Glyph = ({ room }: { room: Room }) =>
  room.kind === 'direct' ? null : room.private ? (
    <Lock size={14} color="$soft" />
  ) : (
    <Hash size={16} color="$soft" />
  )

/** A sentence where rows would be. Same indent, so the column does not jump. */
const Note = ({ children }: { children: React.ReactNode }) => (
  <SizableText px={PAD} py={8} fontSize="$2" color="$dim">
    {children}
  </SizableText>
)
