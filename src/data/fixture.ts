/**
 * A world on purpose, so a screen can be entered in a state rather than in
 * whichever one the server happened to produce.
 *
 * A board that looks right because the plane answered nothing is not a board
 * that works, and a screenshot of it proves nothing about the populated one.
 * So every state a screen has is reachable deliberately, by name, through ONE
 * knob:
 *
 *   ?state=loading    nothing ever answers
 *   ?state=empty      a space with no projects and no messages
 *   ?state=failure    every read refuses
 *   ?state=minimal    one project, four columns, three issues
 *   ?state=realistic  four columns filled, a channel, an inbox
 *
 * Absent the knob this module is inert and every call goes to the real plane.
 * It is one parameter read in one place; there is no build flag, no second
 * entry point and no branch anywhere else in the app.
 *
 * The stand APPLIES the transactions it is given and broadcasts them back, the
 * way the server does — so dragging a card in `?state=realistic` exercises the
 * same write path, the same push, and the same re-read as dragging one in a
 * live space.
 */
import { Category, Class, Priority, Tx, type Channel, type Doc, type Issue, type Message, type Notice, type Person, type Project, type Status } from './model.ts'
import { Socket, type Plane, type Standing, type Wire } from './socket.ts'
import type { SpaceRow } from './account.ts'

const NAMES = ['live', 'loading', 'empty', 'failure', 'minimal', 'realistic'] as const
type Name = (typeof NAMES)[number]

const chosen = (): Name => {
  if (typeof window === 'undefined') return 'live'
  const asked = new URLSearchParams(window.location.search).get('state')
  return (NAMES as readonly string[]).includes(asked ?? '') ? (asked as Name) : 'live'
}

const name = chosen()

/** Whether this session is standing on fixtures at all. A screen may say so. */
export const standing = name

const never = <T>(): Promise<T> => new Promise<T>(() => {})
const refuse = <T>(): Promise<T> => Promise.reject(new Error('the fixture refuses, on purpose'))

// ── the world ─────────────────────────────────────────────────────────────────

const SPACE = 'fixture'
const now = Date.UTC(2026, 8, 8)
const base = (id: string, cls: string): Doc => ({ _id: id, _class: cls, space: SPACE, modifiedOn: now, modifiedBy: 'p1' })

const project: Project = {
  ...base('proj-crm', Class.project),
  space: 'core:space:Space',
  name: 'CRM',
  identifier: 'CRM',
  sequence: 12,
  members: ['p1', 'p2', 'p3', 'p4'],
}

const statuses: Status[] = [
  { ...base('st-backlog', Class.status), name: 'Backlog', category: Category.backlog },
  { ...base('st-todo', Class.status), name: 'To do', category: Category.todo },
  { ...base('st-doing', Class.status), name: 'In progress', category: Category.doing },
  { ...base('st-done', Class.status), name: 'Done', category: Category.done },
]

const people: Person[] = [
  { ...base('p1', Class.person), name: 'Reynolds,Elizabeth' },
  { ...base('p2', Class.person), name: 'Wolf,Sonya' },
  { ...base('p3', Class.person), name: 'Osinski,Kenny' },
  { ...base('p4', Class.person), name: 'Zinovyev,Alexey' },
  { ...base('p5', Class.person), name: 'Christiansen,Billy' },
]

const issue = (n: number, title: string, status: string, priority: number, extra: Partial<Issue> = {}): Issue => ({
  ...base(`i${n}`, Class.issue),
  title,
  status,
  priority,
  number: n,
  assignee: people[n % people.length]._id,
  estimation: 0,
  ...extra,
})

const issues: Issue[] = [
  issue(1, 'Set up cluster monitoring', 'st-backlog', Priority.low, { attachments: 1, labels: 1 }),
  issue(2, "Collect the Linkedin's integration benchmarks", 'st-backlog', Priority.medium, { labels: 1 }),
  issue(3, 'Analyze, cluster, and understand search queries', 'st-backlog', Priority.low, { attachments: 3, comments: 10, labels: 2 }),
  issue(4, 'Sales planning and monitoring of important transactions', 'st-todo', Priority.low, { attachments: 1, comments: 2, labels: 2 }),
  issue(5, 'Rework the user onboarding', 'st-todo', Priority.medium, { comments: 4, labels: 1 }),
  issue(6, 'Telephony + call recording', 'st-todo', Priority.medium, {}),
  issue(7, 'Find the respondents for the moderated testing', 'st-doing', Priority.medium, { labels: 1 }),
  issue(8, 'Conduct custdev interview w/ existing client', 'st-doing', Priority.medium, { attachments: 1, comments: 24, labels: 1 }),
  issue(9, 'Add view-resource for MVP Deal Screen', 'st-doing', Priority.urgent, { labels: 2 }),
  issue(10, 'Ship the seat-count reconciliation', 'st-done', Priority.high, { comments: 6 }),
  issue(11, 'Retire the second colour table', 'st-done', Priority.low, {}),
]

const channels: Channel[] = [
  { ...base('c-general', Class.channel), name: 'general', topic: 'Everything that has no better home' },
  { ...base('c-tracker', Class.channel), name: 'tracker', topic: 'The board' },
]

const messages: Message[] = [
  { ...base('m1', Class.message), message: 'Moved the estimate ring off the reference brand and onto our own accent.', attachedTo: 'c-general', modifiedOn: now - 3_600_000, modifiedBy: 'p2' },
  { ...base('m2', Class.message), message: 'Pushed the column headers flush with the card box — they were sitting on the panel padding.', attachedTo: 'c-general', modifiedOn: now - 1_800_000, modifiedBy: 'p3' },
  { ...base('m3', Class.message), message: '@everyone the tracker is on the real plane now.', attachedTo: 'c-general', modifiedOn: now - 600_000, modifiedBy: 'p1' },
]

/** Five notifications from five different people, because one person's name on
 *  every row is a mapping bug that a fixture written by one author hides. */
const notice = (n: number, by: string, body: string, at: number, on: string, viewed: boolean): Notice => ({
  ...base(`n${n}`, Class.notice),
  modifiedBy: by,
  modifiedOn: at,
  body,
  attachedTo: on,
  attachedToClass: on.startsWith('c-') ? Class.message : Class.issue,
  isViewed: viewed,
})

const notices: Notice[] = [
  notice(1, 'p1', 'mentioned you in a page', now - 600_000, 'i3', false),
  notice(2, 'p2', 'joined the Next Platform project', now - 960_000, 'proj-crm', false),
  notice(3, 'p3', 'in #general — @everyone Hi there!', now - 3_600_000, 'c-general', true),
  notice(4, 'p4', 'added a new tag to the Issues page', now - 10_800_000, 'i7', true),
  notice(5, 'p5', 'changed status CRM-9 to In progress', now - 14_400_000, 'i9', true),
]

const world = (): Map<string, Doc[]> =>
  new Map<string, Doc[]>([
    [Class.project, [structuredClone(project)]],
    [Class.status, structuredClone(statuses)],
    [Class.issue, structuredClone(issues)],
    [Class.person, structuredClone(people)],
    [Class.channel, structuredClone(channels)],
    [Class.message, structuredClone(messages)],
    [Class.notice, structuredClone(notices)],
  ])

const nothing = (): Map<string, Doc[]> =>
  new Map(Object.values(Class).map((c) => [c, [] as Doc[]]))

/** `minimal` is the same world with one column's worth of work in it. */
const trimmed = (): Map<string, Doc[]> => {
  const w = world()
  w.set(Class.issue, structuredClone(issues.slice(0, 3)))
  w.set(Class.message, structuredClone(messages.slice(0, 1)))
  w.set(Class.notice, structuredClone(notices.slice(0, 2)))
  return w
}

// ── the stand ─────────────────────────────────────────────────────────────────

/**
 * A plane over a map. It applies a transaction and broadcasts it, because that
 * is what the server does — so the write path a drag takes is the same one
 * whether the space is real or not.
 */
class Stand implements Plane {
  standing: Standing = 'live'
  readonly account = 'hanzo:fixture'
  private docs: Map<string, Doc[]>
  private listeners = new Set<(txes: Wire[]) => void>()

  constructor(docs: Map<string, Doc[]>) {
    this.docs = docs
  }

  watch(f: (txes: Wire[]) => void) {
    this.listeners.add(f)
    return () => void this.listeners.delete(f)
  }

  observe(f: (s: Standing) => void) {
    f('live')
    return () => {}
  }

  open() {
    return Promise.resolve()
  }

  close() {}

  find<T>(cls: string, query: Record<string, unknown> = {}) {
    const rows = (this.docs.get(cls) ?? []) as unknown as T[]
    return Promise.resolve(rows.filter((r) => matches(r as Record<string, unknown>, query)))
  }

  async one<T>(cls: string, query: Record<string, unknown>) {
    return (await this.find<T>(cls, query))[0]
  }

  write(tx: Wire) {
    const cls = String(tx.objectClass ?? '')
    const rows = this.docs.get(cls) ?? []
    const id = String(tx.objectId ?? '')
    if (tx._class === Tx.create) {
      rows.push({ ...(tx.attributes as object), _id: id, _class: cls, space: SPACE, modifiedOn: Date.now() } as Doc)
    } else if (tx._class === Tx.update) {
      const row = rows.find((r) => r._id === id)
      if (row) Object.assign(row, tx.operations as object, { modifiedOn: Date.now() })
    } else if (tx._class === Tx.remove) {
      this.docs.set(cls, rows.filter((r) => r._id !== id))
    }
    this.docs.set(cls, rows)
    for (const f of this.listeners) f([tx])
    return Promise.resolve()
  }
}

/** The subset of the platform's query language a fixture needs. */
const matches = (row: Record<string, unknown>, query: Record<string, unknown>): boolean =>
  Object.entries(query).every(([field, want]) => {
    const has = row[field]
    if (want && typeof want === 'object' && '$in' in (want as object)) {
      return (((want as { $in: unknown[] }).$in) ?? []).includes(has)
    }
    return has === want
  })

const SPACES: SpaceRow[] = [{ uuid: 'fixture', name: 'Hanzo', url: SPACE, org: 'hanzo', isDisabled: false }]

// ── the one knob ──────────────────────────────────────────────────────────────

export const fixture = {
  /** Whether anything below is standing in for the real plane. */
  on: name !== 'live',

  /** The space list, or the real one. */
  spaces: (live: () => Promise<SpaceRow[]>): Promise<SpaceRow[]> => {
    switch (name) {
      case 'live':
        return live()
      case 'loading':
        return never()
      case 'failure':
        return refuse()
      default:
        return Promise.resolve(SPACES)
    }
  },

  /** The plane for a space, or the real one. */
  plane: (slug: string): Plane => {
    switch (name) {
      case 'live':
        return new Socket(slug)
      case 'empty':
        return new Stand(nothing())
      case 'minimal':
        return new Stand(trimmed())
      case 'realistic':
        return new Stand(world())
      case 'loading':
        return new Held('opening')
      default:
        return new Held('lost')
    }
  },
}

/** A plane that never answers, for the loading and failure states. */
class Held implements Plane {
  readonly account = null
  constructor(readonly standing: Standing) {}
  watch() {
    return () => {}
  }
  observe(f: (s: Standing) => void) {
    f(this.standing)
    return () => {}
  }
  open() {
    return this.standing === 'opening' ? never<void>() : refuse<void>()
  }
  close() {}
  find<T>(): Promise<T[]> {
    return this.standing === 'opening' ? never<T[]>() : refuse<T[]>()
  }
  one<T>(): Promise<T | undefined> {
    return this.standing === 'opening' ? never<T | undefined>() : refuse<T | undefined>()
  }
  write() {
    return refuse<void>()
  }
}
