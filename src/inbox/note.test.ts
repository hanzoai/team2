import assert from 'node:assert/strict'
import { test } from 'node:test'

import { minimal, sample } from './fixture.ts'
import { by, inTab, seen, TABS, unseen } from './note.ts'

const NOW = Date.UTC(2026, 8, 8, 12, 0, 0)
const rows = sample(NOW)

test('every row shape the reference paints is in the fixture', () => {
  // Two unread, a chat row with a quote, a mention, a row whose emphasis falls
  // mid-sentence and a row with no face. Scoring the panel from whichever of
  // those happened to render is scoring it from nothing.
  assert.equal(rows.filter((n) => !n.seen).length, 2)
  assert.ok(rows.some((n) => n.quote))
  assert.ok(rows.some((n) => n.quote?.some((s) => s.mention)))
  assert.ok(rows.some((n) => n.line.length > 2 && n.line.at(-1)?.strong !== true))
  assert.ok(rows.some((n) => n.kind === 'chat'))
  assert.ok(
    rows.some((n) => n.actor.face === undefined),
    'the initials fallback',
  )
})

test('the sentence carries the actor as its first span', () => {
  for (const n of rows) {
    assert.deepEqual(n.line[0], by(n.actor))
    assert.equal(n.line[0]?.strong, true)
  }
})

test('elapsed is exercised at every scale, in unix milliseconds', () => {
  const away = (id: string) => NOW - rows.find((n) => n.id === id)!.at
  const MIN = 60_000
  assert.ok(away('n1') < 60 * MIN, 'a row minutes old')
  assert.ok(away('n4') > 60 * MIN && away('n4') < 24 * 60 * MIN, 'a row hours old')
  assert.ok(away('n9') > 2 * 24 * 60 * MIN, 'a row days old')
  // Milliseconds, not seconds: `teamMessage.createdOn` is ms, and a feed that
  // mixed the two would read every row as 1970 and still render.
  for (const n of rows) assert.ok(n.at > 1_600_000_000_000, `${n.id} is ms`)
})

test('a tab holds its own kind, and all holds the union', () => {
  assert.equal(inTab(rows, 'all').length, rows.length)
  assert.equal(
    inTab(rows, 'task').length + inTab(rows, 'chat').length,
    rows.length,
    'every note lands in exactly one kind tab',
  )
  for (const t of TABS) if (t !== 'all') for (const n of inTab(rows, t)) assert.equal(n.kind, t)
})

test('the badge counts unread per kind, and All is not offered one', () => {
  assert.equal(unseen(rows, 'task'), 2)
  assert.equal(unseen(rows, 'chat'), 0)
  // The reference badges Tasks with 2 and leaves All bare. All's count is the
  // sum of the others, so it is refused by the TYPE rather than suppressed at
  // the call site — there is no `unseen(rows, 'all')` to get wrong.
  // @ts-expect-error 'all' is not a Kind, and that is the point.
  void (() => unseen(rows, 'all'))
})

test('reading one clears exactly one', () => {
  const after = seen(rows, 'n1')
  assert.equal(unseen(after, 'task'), 1)
  assert.equal(after.find((n) => n.id === 'n1')!.seen, true)
  assert.equal(after.find((n) => n.id === 'n2')!.seen, false)
  assert.equal(rows.find((n) => n.id === 'n1')!.seen, false, 'the original is untouched')
})

test('populated-minimal is one unread row, not an empty list', () => {
  const one = minimal(NOW)
  assert.equal(one.length, 1)
  assert.equal(one[0]!.seen, false)
})
