/**
 * Where the data door meets the regions, and the only module that knows both.
 *
 * Each region states the shape it needs — the board a `Source` of issues, the
 * inbox a `Source` of notes — and `src/data` states what the plane holds.
 * Neither imports the other, which is what keeps them independent; something
 * has to introduce them, and this is deliberately the second-smallest file in
 * the tree after `routes.tsx`.
 *
 * The mapping lives here rather than in either side because it is a fact about
 * the PAIR: a platform `IssueStatus.category` becoming the word `progress` is
 * not something the tracker knows or something the model states.
 */
import { useEffect, useMemo } from 'react'

import { Category, nameOf, ref, type Issue as Doc, type Person as Human, type Project, type Status } from '~/data/model.ts'
import { see as seeNotice, notices } from '~/data/notice.ts'
import type { Plane } from '~/data/socket.ts'
import { useSpace } from '~/data/space.tsx'
import { issues, move, people, project as readProject, statuses } from '~/data/tracker.ts'
import { serve } from '~/inbox/feed.ts'
import type { Note, Span } from '~/inbox/note.ts'
import type { Issue, Source as Board, Status as Column } from '~/tracker/board/model.ts'

/** A platform category, as the board spells it. */
const COLUMN: Record<string, Column> = {
  [Category.backlog]: 'backlog',
  [Category.todo]: 'todo',
  [Category.doing]: 'progress',
  [Category.done]: 'done',
  [Category.cancelled]: 'done',
}

/** The platform ranks priority 0..4; the board names the four it draws. */
const RANK = [undefined, 'urgent', 'high', 'medium', 'low'] as const

/**
 * Completion, 0..1.
 *
 * Time reported against time estimated, which is the only completion the model
 * actually holds — there is no percentage field, and inventing one from the
 * status would draw a ring that says nothing. An issue with no estimate reads
 * as zero rather than as full, because unknown is nearer to nothing done than
 * to everything done.
 */
const done = (issue: Doc): number => {
  const estimate = issue.estimation ?? 0
  if (estimate <= 0) return 0
  return Math.max(0, Math.min(1, (issue.reportedTime ?? 0) / estimate))
}

const card = (
  issue: Doc,
  columns: Map<string, Column>,
  crowd: Map<string, Human>,
  project: Project | undefined,
): Issue => {
  const who = issue.assignee ? crowd.get(issue.assignee) : undefined
  return {
    id: issue._id,
    key: ref(project, issue),
    title: issue.title,
    status: columns.get(issue.status) ?? 'backlog',
    priority: RANK[issue.priority] ?? undefined,
    // The model stores a label COUNT on the issue and the labels themselves as
    // separate documents. Reading them is a second query per board, and the
    // card renders the words rather than the number, so it is left to whoever
    // needs it rather than approximated with a count nobody can read.
    labels: [],
    done: done(issue),
    people: who ? [{ id: who._id, name: nameOf(who), face: who.avatar ?? undefined }] : [],
    files: issue.attachments ?? 0,
    replies: issue.comments ?? 0,
  }
}

/**
 * The board's source over the space plane.
 *
 * `watch` re-reads on every transaction the plane broadcasts, which is how a
 * card somebody else moved arrives — and how a card THIS browser moved arrives,
 * because the server echoes a write back to the session that made it. One path,
 * so the two cannot disagree.
 */
const board = (plane: Plane, space: string): Board => ({
  watch(next, fail) {
    let live = true
    const read = () => {
      void Promise.all([statuses(plane, space), issues(plane, space), people(plane)])
        .then(async ([columns, work, crowd]) => {
          if (!live) return
          const project = work.length ? await readProject(plane, space) : undefined
          if (!live) return
          const byId = new Map(columns.map((c: Status) => [c._id, COLUMN[c.category] ?? 'backlog']))
          const byPerson = new Map(crowd.map((p) => [p._id, p]))
          next(work.map((issue) => card(issue, byId, byPerson, project)))
        })
        .catch((e: unknown) => live && fail(e instanceof Error ? e : new Error(String(e))))
    }
    read()
    const stop = plane.watch(read)
    return () => {
      live = false
      stop()
    }
  },
  async move(id, to, before) {
    const work = await issues(plane, space)
    const columns = await statuses(plane, space)
    const held = work.find((i) => i._id === id)
    const target = columns.find((c) => (COLUMN[c.category] ?? 'backlog') === to)
    if (!held || !target) throw new Error(`no ${held ? 'column' : 'issue'} to move ${held ? 'into' : ''}`)
    const column = work.filter((i) => i.status === target._id && i._id !== id)
    const at = before ? column.findIndex((i) => i._id === before) : column.length
    const cut = at < 0 ? column.length : at
    await move(plane, plane.account ?? '', held, target._id, {
      before: column[cut - 1],
      after: column[cut],
    })
  },
})

/** The board's backend, or null while no space is open. */
export const useBoard = (): Board | null => {
  const { plane, current } = useSpace()
  return useMemo(() => (plane && current ? board(plane, current.uuid) : null), [plane, current])
}

/**
 * A notification's sentence.
 *
 * The platform stores a notification as a reference plus a type, and the
 * sentence a person reads is composed by whichever presenter renders it — all
 * of which are Svelte components this client does not run. So the sentence here
 * is the two runs the documents actually carry: who acted, and what the
 * notification says. It is honest and it is short of the reference, which
 * writes three runs; closing that means reading the referenced document, and
 * that is a query per row.
 */
const sentence = (title: string, body: string): Span[] => {
  const spans: Span[] = [{ text: title, strong: true }]
  if (body) spans.push({ text: ` ${body}` })
  return spans
}

const note = (row: Awaited<ReturnType<typeof notices>>[number], crowd: Map<string, Human>): Note => {
  const actor = crowd.get(String(row.modifiedBy ?? ''))
  const name = actor ? nameOf(actor) : 'Somebody'
  return {
    id: row._id,
    kind: String(row.attachedToClass ?? '').startsWith('chunter:') ? 'chat' : 'task',
    actor: { name, face: actor?.avatar ?? undefined },
    line: sentence(name, row.body ?? row.title ?? ''),
    at: row.modifiedOn,
    place: '',
    seen: row.isViewed,
  }
}

/**
 * Hand the inbox its backend.
 *
 * The feed keeps one source at module scope, so this is an effect rather than a
 * value — and it re-runs on a space change, because a feed read in one space is
 * not true in another.
 */
export const Serve = () => {
  const { plane, current } = useSpace()
  useEffect(() => {
    // Always serve, even with nothing to serve from. The feed keeps a fixture
    // as its own default so the region can be developed alone, and a live build
    // that left it installed would paint five invented notifications beside a
    // real board — a mock presented as working, which is worse than an empty
    // panel. Handing it a source that refuses says the true thing instead.
    if (!plane || !current) {
      const nothing = () => Promise.reject(new Error('no space is open'))
      serve({ list: nothing, see: nothing })
      return
    }
    const space = current.uuid
    serve({
      async list() {
        const [rows, crowd] = await Promise.all([notices(plane, space), people(plane)])
        const byPerson = new Map(crowd.map((p) => [p._id, p]))
        return rows.map((row) => note(row, byPerson))
      },
      async see(id: string) {
        const rows = await notices(plane, space)
        const row = rows.find((r) => r._id === id)
        if (row && !row.isViewed) await seeNotice(plane, plane.account ?? '', row)
      },
    })
  }, [plane, current])
  return null
}
