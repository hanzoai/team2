/**
 * The feed with no backend behind it, and why that is not a demo.
 *
 * A panel scored from whatever the server happened to return is a panel scored
 * from nothing: an Inbox that looks right because the request 404'd looks
 * exactly like an Inbox that is genuinely empty. So every state a reader can
 * reach is a `Source` you can mount deliberately — `still(sample())`,
 * `still([])`, `waiting`, `broken` — and each is judged on its own.
 *
 * `sample` carries one row of every shape the reference paints, and three the
 * reference does not: a row minutes old, one hours old and one DAYS old, so the
 * elapsed line is exercised at every scale it has to be right at.
 */
import { by, type Note, type Source } from './note.ts'

const MIN = 60_000
const HOUR = 60 * MIN
const DAY = 24 * HOUR

const elizabeth = { name: 'Elizabeth Reynolds' }
const sonya = { name: 'Sonya Wolf' }
const kenny = { name: 'Kenny Osinski' }
const alexey = { name: 'Alexey Zinovyev' }
const billy = { name: 'Billy Christiansen' }
const warren = { name: 'Warren Thompson' }
const shelia = { name: 'Shelia Price' }

/**
 * Every row shape, newest first.
 *
 * Offsets rather than instants: the elapsed line reads from the clock, so a
 * fixed timestamp would say "3 months ago" a quarter after it was written and
 * the one thing this fixture exists to exercise would stop being exercised.
 */
export const sample = (now: number = Date.now()): Note[] => [
  {
    id: 'n1',
    kind: 'task',
    actor: elizabeth,
    line: [by(elizabeth), { text: ' mentioned you in a page' }],
    at: now - 10 * MIN,
    place: 'Marketing and PM',
    seen: false,
  },
  {
    id: 'n2',
    kind: 'task',
    actor: sonya,
    line: [by(sonya), { text: ' joined to ' }, { text: 'Next Platform', strong: true }, { text: ' project' }],
    at: now - 16 * MIN,
    place: 'Next Platform',
    seen: false,
  },
  {
    // The chat shape: a headline, then the message itself on its own line with
    // the mention that put it here. Nothing else in the panel has two blocks.
    id: 'n3',
    kind: 'chat',
    actor: kenny,
    line: [by(kenny), { text: ' in ' }, { text: '#General', strong: true }],
    quote: [{ text: '@everyone', mention: true }, { text: " Hi there! Let's discuss the release" }],
    at: now - HOUR,
    place: 'General',
    seen: true,
  },
  {
    id: 'n4',
    kind: 'task',
    actor: alexey,
    line: [by(alexey), { text: ' added new tag to the ' }, { text: 'Issues', strong: true }, { text: ' page' }],
    at: now - 3 * HOUR,
    place: 'CRM',
    seen: true,
  },
  {
    // An entity that is neither a person nor a page: a workflow status. The
    // issue identifier beside it is deliberately NOT emphasised — the status is
    // the news, and the reference draws exactly that split.
    id: 'n5',
    kind: 'task',
    actor: billy,
    line: [by(billy), { text: ' changed status UBER-5671 to ' }, { text: 'In Progress', strong: true }],
    at: now - 4 * HOUR,
    place: 'Marketing and PM',
    seen: true,
  },
  {
    id: 'n6',
    kind: 'task',
    actor: warren,
    line: [by(warren), { text: ' added new task to the ' }, { text: 'Issues', strong: true }, { text: ' page' }],
    at: now - 8 * HOUR,
    place: 'CRM',
    seen: true,
  },
  {
    id: 'n7',
    kind: 'task',
    actor: shelia,
    line: [by(shelia), { text: ' mentioned you in a page' }],
    at: now - 9 * HOUR,
    place: 'CRM',
    seen: true,
  },
  {
    // One line, no wrap. Every row in the capture happens to run to two, so
    // this shape is ours — and it is here because a feed that never produced
    // one would be a feed nobody had asked.
    id: 'n8',
    kind: 'chat',
    actor: sonya,
    line: [by(sonya), { text: ' replied' }],
    quote: [{ text: 'Shipping it' }],
    at: now - DAY,
    place: 'Design',
    seen: true,
  },
  {
    // Days, so the elapsed line is exercised past its hour boundary.
    id: 'n9',
    kind: 'task',
    actor: kenny,
    line: [by(kenny), { text: ' assigned ' }, { text: 'UBER-4102', strong: true }, { text: ' to you' }],
    at: now - 3 * DAY,
    place: 'Next Platform',
    seen: true,
  },
  {
    // NO PLACE. Not every notification happens somewhere nameable, and the live
    // mapping cannot name one yet — so the meta line has to be a time alone
    // rather than a time, a bullet and a gap.
    id: 'n10',
    kind: 'task',
    actor: warren,
    line: [by(warren), { text: ' invited you to the workspace' }],
    at: now - 9 * DAY,
    seen: true,
  },
]

/** One unread task and nothing else — the populated-minimal state. */
export const minimal = (now: number = Date.now()): Note[] => sample(now).slice(0, 1)

/** A source that answers, once, with what it was given. */
export const still = (notes: Note[]): Source => ({
  list: () => Promise.resolve(notes),
  see: () => Promise.resolve(),
})

/** A source that never answers — the loading state, held open. */
export const waiting: Source = {
  list: () => new Promise<Note[]>(() => {}),
  see: () => Promise.resolve(),
}

/** A source that refuses — the failure state. */
export const broken: Source = {
  list: () => Promise.reject(new Error('inbox unavailable')),
  see: () => Promise.reject(new Error('inbox unavailable')),
}

/** A source that lists, then refuses the read, so the cleared row comes back. */
export const refuses = (notes: Note[]): Source => ({
  list: () => Promise.resolve(notes),
  see: () => Promise.reject(new Error('refused')),
})
