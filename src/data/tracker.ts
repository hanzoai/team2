/**
 * The tracker, over the space plane.
 *
 * There is no REST for any of this. Projects, statuses, issues, people and
 * their transactions all ride the transactor socket, so every function here
 * takes a `Plane` and nothing here knows a URL. That is also why the tracker
 * cannot be read at all until a space is open: a screen asking for issues with
 * no plane is not empty, it is unanswered, and saying the first would be a lie
 * a board then paints as a space with no work in it.
 */
import { Category, Class, key, type Issue, type Person, type Project, type Status } from './model.ts'
import type { Plane } from './socket.ts'
import { between, create, update } from './write.ts'

/** The order the four categories stand in on a board. Left to right. */
export const ORDER = [Category.backlog, Category.todo, Category.doing, Category.done] as const

export const projects = (plane: Plane) => plane.find<Project>(Class.project)

export const project = (plane: Plane, id: string) => plane.one<Project>(Class.project, { _id: id })

/**
 * A project's workflow states, in board order.
 *
 * The platform stores an order WITHIN a category and says nothing about the
 * categories themselves, so the outer order is stated here — it is the same on
 * every board and is not a per-space fact.
 */
export const statuses = async (plane: Plane, space: string) => {
  const rows = await plane.find<Status>(Class.status, { space })
  const rank = new Map<string, number>(ORDER.map((c, i) => [c, i]))
  return rows.sort(
    (a, b) =>
      (rank.get(a.category) ?? ORDER.length) - (rank.get(b.category) ?? ORDER.length) ||
      (a.rank ?? '').localeCompare(b.rank ?? ''),
  )
}

export const issues = async (plane: Plane, space: string) => {
  const rows = await plane.find<Issue>(Class.issue, { space })
  return rows.sort((a, b) => (a.rank ?? '').localeCompare(b.rank ?? '') || a.number - b.number)
}

export const people = (plane: Plane) => plane.find<Person>(Class.person)

/** The keys these reads are held under. The class comes first; see `key`. */
export const keys = {
  projects: () => key(Class.project),
  statuses: (space: string) => key(Class.status, space),
  issues: (space: string) => key(Class.issue, space),
  people: () => key(Class.person),
}

/**
 * Move an issue: a new column, and a rank between the two cards it landed
 * between.
 *
 * One transaction, and the change reaches this screen the same way it reaches
 * everybody else's — on the broadcast. There is no local patch, because a local
 * patch and a broadcast are two implementations of one fact and they disagree
 * the first time a write is refused.
 */
export const move = (
  plane: Plane,
  by: string,
  issue: Issue,
  status: string,
  neighbours: { before?: Issue; after?: Issue } = {},
) =>
  plane.write(
    update(issue, by, {
      status,
      rank: between(neighbours.before?.rank, neighbours.after?.rank),
    }),
  )

/** Anything else about an issue: a title, an assignee, a priority, an estimate. */
export const amend = (plane: Plane, by: string, issue: Issue, fields: Partial<Issue>) =>
  plane.write(update(issue, by, fields as Record<string, unknown>))

/**
 * A new issue at the top of a column.
 *
 * The number is the project's `sequence` incremented in the same breath. The
 * platform allocates it with `$inc` inside a conditional apply so two people
 * creating at once cannot both take 43; that shape is not reachable through
 * this client's single-transaction write, so the number here is optimistic and
 * the server is the authority on it. A collision shows up as two cards sharing
 * an identifier, which is visible and recoverable — unlike a lost card.
 */
export const open = (
  plane: Plane,
  by: string,
  space: string,
  fields: { title: string; status: string; priority: number; number: number; after?: Issue },
) =>
  plane.write(
    create(space, by, Class.issue, {
      title: fields.title,
      status: fields.status,
      priority: fields.priority,
      number: fields.number,
      rank: between(undefined, fields.after?.rank),
      assignee: null,
      subIssues: 0,
      comments: 0,
      attachments: 0,
      estimation: 0,
      reportedTime: 0,
      remainingTime: 0,
    }),
  )
