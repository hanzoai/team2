import { deepEqual, equal } from 'node:assert/strict'
import { test } from 'node:test'

import type { Message } from './chat.ts'
import { dayName, entries } from './group.ts'

const at = (iso: string) => new Date(iso).getTime()

const say = (id: string, author: string, iso: string): Message => ({
  id,
  room: 'r',
  author,
  lines: [id],
  at: at(iso),
  replies: 0,
})

const runs = (m: Message[]) => entries(m).filter((e) => e.kind === 'run')
const days = (m: Message[]) => entries(m).filter((e) => e.kind === 'day')

test('nothing said is nothing drawn', () => {
  deepEqual(entries([]), [])
})

test('one person in one breath is one run', () => {
  const m = [
    say('a', 'z', '2026-09-08T10:00:00'),
    say('b', 'z', '2026-09-08T10:01:00'),
    say('c', 'z', '2026-09-08T10:04:30'),
  ]
  const r = runs(m)
  equal(r.length, 1)
  deepEqual(r[0].messages.map((x) => x.id), ['a', 'b', 'c'])
  // The run is keyed and stamped by its FIRST message, which is the one whose
  // time is drawn beside the name.
  equal(r[0].id, 'a')
  equal(r[0].at, at('2026-09-08T10:00:00'))
})

test('a different person breaks the run', () => {
  const m = [
    say('a', 'z', '2026-09-08T10:00:00'),
    say('b', 'q', '2026-09-08T10:00:30'),
    say('c', 'z', '2026-09-08T10:01:00'),
  ]
  deepEqual(runs(m).map((r) => r.author), ['z', 'q', 'z'])
})

test('a gap breaks the run, and the window is measured from the LAST message', () => {
  // Five one-minute steps: a run measured from its first message would split at
  // the sixth, but a conversation that never paused is one turn.
  const steady = ['10:00', '10:01', '10:02', '10:03', '10:04', '10:05', '10:06'].map((t, i) =>
    say(String(i), 'z', `2026-09-08T${t}:00`),
  )
  equal(runs(steady).length, 1)

  const paused = [say('a', 'z', '2026-09-08T10:00:00'), say('b', 'z', '2026-09-08T10:05:01')]
  equal(runs(paused).length, 2)
})

test('a day heading precedes the first message and every change of day', () => {
  const m = [
    say('a', 'z', '2026-09-07T23:59:00'),
    say('b', 'z', '2026-09-08T00:00:30'),
  ]
  const all = entries(m)
  // Same author, thirty seconds apart, and STILL two runs — the calendar day
  // changed, and a run that spans a heading would be drawn either side of it.
  equal(days(m).length, 2)
  equal(runs(m).length, 2)
  equal(all[0].kind, 'day')
  deepEqual(all.map((e) => e.kind), ['day', 'run', 'day', 'run'])
})

test('every entry has a distinct key, because React draws them by key', () => {
  const m = [
    say('a', 'z', '2026-09-07T10:00:00'),
    say('b', 'q', '2026-09-08T10:00:00'),
    say('c', 'q', '2026-09-08T11:00:00'),
  ]
  const keys = entries(m).map((e) => e.id)
  equal(new Set(keys).size, keys.length)
})

test('every message survives the grouping', () => {
  const m = Array.from({ length: 60 }, (_, i) =>
    say(String(i), i % 7 === 0 ? 'q' : 'z', new Date(at('2026-09-08T09:00:00') + i * 90_000).toISOString()),
  )
  const kept = runs(m).flatMap((r) => r.messages.map((x) => x.id))
  deepEqual(kept, m.map((x) => x.id))
})

test('a day is named the way a person refers to it', () => {
  const now = at('2026-09-08T12:00:00')
  equal(dayName(at('2026-09-08T09:00:00'), now), 'Today')
  equal(dayName(at('2026-09-07T23:30:00'), now), 'Yesterday')
  // Thirty minutes earlier, across midnight, is still YESTERDAY — a difference
  // of timestamps would call it today.
  equal(dayName(at('2026-09-07T23:59:00'), at('2026-09-08T00:29:00')), 'Yesterday')
  equal(dayName(at('2026-09-02T09:00:00'), now).includes('2'), true)
})
