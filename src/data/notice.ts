/**
 * The inbox, over the space plane.
 *
 * The feed is generated server-side — `notify.go` projects mentions, direct
 * messages, comments and assignee changes into the platform's notification
 * objects, each carrying its own read flag — so this is a read of documents and
 * not a second feed built here out of activity. Reading one is a transaction
 * like any other, which is why it reaches this browser's other tabs and this
 * person's other devices without anything polling.
 */
import { Class, key, type Notice } from './model.ts'
import type { Plane } from './socket.ts'
import { update } from './write.ts'

export const notices = async (plane: Plane, space: string) => {
  const rows = await plane.find<Notice>(Class.notice, { space })
  return rows.sort((a, b) => b.modifiedOn - a.modifiedOn)
}

export const keys = { notices: (space: string) => key(Class.notice, space) }

/** Reading one. The flag is the platform's own, so every surface agrees. */
export const see = (plane: Plane, by: string, notice: Notice) =>
  plane.write(update(notice, by, { isViewed: true }))
