/**
 * How a conversation is read: runs of messages, and the days between them.
 *
 * A channel is not a list of messages, it is a list of TURNS. Somebody who says
 * three things in a row said them once, and drawing their name and face three
 * times says they interrupted themselves twice. So the list is grouped before
 * it is drawn, and the grouping is pure — which is what lets it be tested
 * without a renderer and reused by the thread panel unchanged.
 *
 * Two messages join a run when the same person sent them, close enough
 * together, on the same day. The window is five minutes because that is roughly
 * how long a person keeps typing about one thing; a longer one fuses a morning
 * and an afternoon into one turn, and a shorter one splits a sentence somebody
 * sent in two halves.
 */
import type { Message } from './chat.ts'

const WINDOW = 5 * 60 * 1000

/** One person's uninterrupted turn. */
export type Run = {
  /** The first message's id, which is stable and unique — so it is the key. */
  id: string
  author: string
  at: number
  messages: Message[]
}

/** A run, or the date heading that precedes one. */
export type Entry = { kind: 'day'; id: string; at: number } | ({ kind: 'run' } & Run)

/**
 * Messages, oldest first, into what the list draws.
 *
 * A day heading is emitted whenever the calendar day changes, INCLUDING before
 * the first message: a conversation with no heading at the top leaves the
 * reader to guess whether the first thing they see is from today or from March.
 */
export const entries = (messages: Message[]): Entry[] => {
  const out: Entry[] = []
  let run: Run | null = null
  let day = ''

  for (const m of messages) {
    const today = dayOf(m.at)
    if (today !== day) {
      day = today
      run = null
      out.push({ kind: 'day', id: `day:${today}`, at: m.at })
    }
    if (run && run.author === m.author && m.at - last(run).at <= WINDOW) {
      run.messages.push(m)
      continue
    }
    run = { id: m.id, author: m.author, at: m.at, messages: [m] }
    out.push({ kind: 'run', ...run })
  }
  return out
}

const last = (r: Run): Message => r.messages[r.messages.length - 1]

/** The local calendar day, which is the one a reader is in. */
const dayOf = (at: number): string => {
  const d = new Date(at)
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

/**
 * How a day is named in a heading.
 *
 * Today and yesterday get words because that is how people refer to them; older
 * days get a date, because "four days ago" makes a reader count.
 */
export const dayName = (at: number, now = Date.now()): string => {
  const days = midnights(now) - midnights(at)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  const d = new Date(at)
  const year = d.getFullYear() === new Date(now).getFullYear() ? undefined : 'numeric'
  return d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year })
}

// Whole local days since the epoch, so a difference is a count of midnights
// crossed rather than a count of 24-hour spans — which is what "yesterday"
// means, and what a subtraction of timestamps gets wrong across a DST change.
const midnights = (at: number): number => {
  const d = new Date(at)
  return Math.floor((at - d.getTimezoneOffset() * 60_000) / 86_400_000)
}

/** The clock time on a message, which is all a reader needs beside a name. */
export const clock = (at: number): string =>
  new Date(at).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
