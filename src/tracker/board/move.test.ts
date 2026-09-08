import assert from 'node:assert/strict'
import { test } from 'node:test'
import { columns, move } from './move.ts'
import type { Issue, Status } from './model.ts'

const at = (id: string, status: Status): Issue => ({
  id, key: id, title: id, status, labels: [], done: 0, people: [], files: 0, replies: 0,
})

const board = [at('a', 'backlog'), at('b', 'backlog'), at('c', 'todo'), at('d', 'done')]
const where = (issues: Issue[]) => issues.map((i) => `${i.id}:${i.status}`).join(' ')

test('every status is a column, including the empty ones', () => {
  const cols = columns([at('a', 'backlog')])
  assert.equal(cols.length, 4)
  assert.deepEqual(cols.map((c) => c.issues.length), [1, 0, 0, 0])
})

test('a move to the end of another column changes status and order', () => {
  assert.equal(where(move(board, 'a', 'done')), 'b:backlog c:todo d:done a:done')
})

test('a move before a card lands there, not at the end', () => {
  assert.equal(where(move(board, 'a', 'done', 'd')), 'b:backlog c:todo a:done d:done')
})

test('reordering inside a column keeps the status', () => {
  assert.equal(where(move(board, 'b', 'backlog', 'a')), 'b:backlog a:backlog c:todo d:done')
})

test('a move onto itself is a no-op, by identity', () => {
  assert.equal(move(board, 'a', 'backlog', 'a'), board)
  assert.equal(move(board, 'd', 'done'), board)
})

test('an unknown id changes nothing', () => {
  assert.equal(move(board, 'zzz', 'done'), board)
})

test('a move into an empty column works', () => {
  assert.equal(where(move(board, 'a', 'progress')), 'b:backlog c:todo d:done a:progress')
})
