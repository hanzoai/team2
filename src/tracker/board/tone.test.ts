import assert from 'node:assert/strict'
import { test } from 'node:test'

import { dot, tone } from './tone.ts'
import { PRIORITY, STATUS } from './model.ts'

const fill = (label: string, priority?: Parameters<typeof tone>[1]) => tone(label, priority).background

test('a tag is the same colour everywhere, whatever case it is written in', () => {
  assert.equal(fill('Design'), fill('Design'))
  assert.equal(fill('design'), fill('Design'))
})

test('the ring is closed however many tags there are', () => {
  const seen = new Set<string>()
  for (let i = 0; i < 500; i++) seen.add(fill(`tag-${i}`))
  assert.equal(seen.size, 6)
})

test('priority overrides the ring, and only for its own word', () => {
  // Two tiers: the urgent end carries the alert hue, the rest carry none.
  assert.equal(fill('high', 'high'), fill('urgent', 'urgent'))
  assert.equal(fill('low', 'low'), fill('medium', 'medium'))
  assert.notEqual(fill('low', 'low'), fill('high', 'high'))
  // A label that is not the priority's own word is still a label.
  assert.equal(fill('Design', 'high'), fill('Design'))
})

test('every chip states its own ink, so no call site picks one', () => {
  for (const p of PRIORITY) assert.ok(tone(p, p).color.startsWith('var(--'))
  assert.ok(tone('Design').color.startsWith('var(--'))
})

test('every status has a dot, and every dot is a token', () => {
  for (const s of STATUS) assert.match(dot[s], /^var\(--/)
})
