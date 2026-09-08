/**
 * THE CHAT SCREEN — a room's header, its conversation, and a composer.
 *
 * The header is the reference board's own, one field at a time: the quiet line
 * the breadcrumb occupies carries the topic, the title row carries the name and
 * the member faces, and the whole thing sits on the board's inset. There is no
 * tab row, because a channel has one view and the board's tabs exist to choose
 * between three — a row of one tab is a row that says nothing.
 *
 * Everything below the header is the same for a channel and a direct message.
 * The difference between them is a glyph and a name, which is where it belongs.
 */
import { SizableText, XStack, YStack } from '@hanzo/ui'
import { EmptyState } from '@hanzo/ui/product'
import { Hash, Lock, MessagesSquare } from '@hanzogui/lucide-icons-2'
import { useCallback, useMemo, useState } from 'react'
import { useParams } from 'react-router'

import { invalidate } from '~/data/query.ts'
import { useSpace } from '~/data/space.tsx'
import { author, react, reply, say, unreact, type Message, type Room, type Signed } from './chat.ts'
import { Composer } from './Composer.tsx'
import { List } from './List.tsx'
import { People } from './People.tsx'
import { useLive, useMessages, usePeople, useReactions, useReplies, useRooms } from './read.ts'
import { Thread } from './Thread.tsx'
import { tally } from './Run.tsx'

export function Chat() {
  const { room: id } = useParams()
  const { plane } = useSpace()
  const rooms = useRooms()
  const room = useMemo(() => (rooms.data ?? []).find((r) => r.id === id) ?? null, [rooms.data, id])

  const conversation = useMessages(room?.id ?? null)
  const roster = usePeople()
  const messages = conversation.data ?? []
  const ids = useMemo(() => messages.map((m) => m.id), [messages])
  const feelings = useReactions(ids)
  useLive(room?.id ?? null)

  const [thread, setThread] = useState<string | null>(null)
  const parent = messages.find((m) => m.id === thread) ?? null
  const answers = useReplies(parent?.id ?? null)

  const me = plane ? (author(plane as Signed) ?? '') : ''
  const people = roster.data ?? []
  const reactions = feelings.data ?? []

  /**
   * React, or take it back.
   *
   * The same press does both, because a reaction chip is a toggle and a
   * separate un-react control would be a second thing to find for an action
   * that has one obvious place.
   */
  const onReact = useCallback(
    (message: Message, emoji: string) => {
      if (!plane || !room) return
      const held = tally(reactions.filter((r) => r.message === message.id)).find((g) => g.emoji === emoji)
      const mine = reactions.find((r) => r.message === message.id && r.emoji === emoji && r.by === me)
      void (held && mine
        ? unreact(plane as Signed, room, mine)
        : react(plane as Signed, room, message, emoji)
      ).then(() => invalidate('chat:reactions:'))
    },
    [plane, room, reactions, me],
  )

  if (!id) return <Pick />
  if (rooms.phase === 'ready' && !room) return <Gone />
  if (!room || !plane) return <YStack flex={1} />

  return (
    <XStack flex={1} minH={0}>
      <YStack flex={1} minW={0} minH={0}>
        <Header room={room} people={people} />

        <List
          room={room}
          phase={conversation.phase}
          error={conversation.error}
          messages={messages}
          people={people}
          reactions={reactions}
          me={me}
          onRetry={conversation.reload}
          onReact={onReact}
          onOpen={(m) => setThread(m.id)}
          open={thread ?? undefined}
        />

        <Composer
          placeholder={room.kind === 'direct' ? `Message ${room.name}` : `Message #${room.name}`}
          onSend={(text) => say(plane as Signed, room, text)}
        />
      </YStack>

      {parent ? (
        <Thread
          room={room}
          parent={parent}
          replies={answers.data ?? []}
          phase={answers.phase}
          error={answers.error}
          people={people}
          reactions={reactions}
          me={me}
          onClose={() => setThread(null)}
          onRetry={answers.reload}
          onReact={onReact}
          onSend={(text) => reply(plane as Signed, room, parent, text)}
        />
      ) : null}
    </XStack>
  )
}

/**
 * The room's own header.
 *
 * The topic sits where the board draws its breadcrumb — the quiet line above
 * the title — because it is the same kind of information: where you are, said
 * without weight. A room with no topic leaves the line out rather than filling
 * it with a placeholder.
 */
function Header({ room, people }: { room: Room; people: ReturnType<typeof usePeople>['data'] }) {
  return (
    <YStack px={24} pt={16} pb={12} gap={4} borderBottomWidth={1} borderBottomColor="$edge">
      {room.topic ? (
        <SizableText fontSize="$2" color="$dim" numberOfLines={1}>
          {room.topic}
        </SizableText>
      ) : null}
      <XStack items="center" gap={12}>
        <XStack flex={1} minW={0} items="center" gap={7}>
          {room.kind === 'direct' ? null : room.private ? (
            <Lock size={17} color="$quiet" />
          ) : (
            <Hash size={19} color="$quiet" />
          )}
          <SizableText fontSize="$7" fontWeight="500" color="$ink" numberOfLines={1}>
            {room.name}
          </SizableText>
        </XStack>
        <People members={room.members} people={people ?? []} />
      </XStack>
    </YStack>
  )
}

/** No room in the address: the surface opened, and nothing is chosen. */
const Pick = () => (
  <Middle>
    <EmptyState
      icon={MessagesSquare}
      title="Chat"
      description="Choose a channel or a conversation to read it."
    />
  </Middle>
)

/** An address that named a room this space does not have. */
const Gone = () => (
  <Middle>
    <EmptyState
      icon={MessagesSquare}
      title="No such room"
      description="It may have been archived, or it may belong to another space."
    />
  </Middle>
)

const Middle = ({ children }: { children: React.ReactNode }) => (
  <YStack flex={1} items="center" justify="center" p={24}>
    {children}
  </YStack>
)
