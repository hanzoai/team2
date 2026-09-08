/**
 * The team surface of the estate API, `/v1/team/*` on api.hanzo.ai.
 *
 * These are the operations the cloud binary's team plugin publishes over HTTP.
 * The tracker's own domain — issues, projects, milestones — has no REST at all
 * and lives behind the transactor socket, so it is not here.
 *
 * A room IS a channel. The backend calls it a room and so does this module;
 * renaming it at the seam would put two words on one concept for no gain, and
 * the wire is the authority on its own vocabulary.
 */
import { call } from './api'
import { token } from './iam'

/** A conversation. `direct` distinguishes a DM from a named channel. */
export type Room = {
  id: string
  space: string
  name: string
  topic?: string
  direct?: boolean
  private?: boolean
  archived?: boolean
  members?: string[]
  life?: string
  bindings?: string[]
}

/** One message. `createdOn` is unix MILLISECONDS, and `text` is plain text. */
export type Message = {
  id: string
  room: string
  author: string
  text: string
  createdOn: number
}

const auth = token

export const rooms = () =>
  call<{ rooms: Room[] }>('/v1/team/rooms', { auth }).then((r) => r.rooms ?? [])

export const createRoom = (body: {
  name: string
  space?: string
  topic?: string
  private?: boolean
  members?: string[]
}) => call<Room>('/v1/team/rooms', { method: 'POST', body: JSON.stringify(body), auth })

export const messages = (room: string, space: string) =>
  call<{ messages: Message[] }>(
    `/v1/team/rooms/${encodeURIComponent(room)}/messages?space=${encodeURIComponent(space)}`,
    { auth },
  ).then((r) => r.messages ?? [])

export const send = (room: string, space: string, text: string) =>
  call<Message>(`/v1/team/rooms/${encodeURIComponent(room)}/messages`, {
    method: 'POST',
    body: JSON.stringify({ space, text }),
    auth,
  })
