import assert from 'node:assert/strict'
import { test } from 'node:test'

import { decode, encode, Kind, type Envelope } from './zap.ts'

/**
 * The cross-language contract. This is the same constant `TestGoldenHex`
 * asserts in cloud `apps/team/envelope_test.go`, character for character — so
 * either implementation moving without the other turns one of the two suites
 * red, which is the only thing that keeps a hand-written codec honest.
 */
const golden =
  '5a4150000200000010000000' + // header: ZAP\0 ver 2 flags 0 root 16
  '2b000000' + // size 43
  '01000000' + // id 1
  '00' + '000000' + // kind 0 + pad
  '10000000' + '02000000' + // method ptr: rel 16 len 2
  '0a000000' + '01000000' + // payload ptr: rel 10 len 1
  '6869' + '58' // "hi" + "X"

const hex = (b: Uint8Array) => Array.from(b, (c) => c.toString(16).padStart(2, '0')).join('')
const utf8 = new TextEncoder()

test('encodes the golden frame', () => {
  const bytes = encode({ id: 1, kind: Kind.request, method: 'hi', payload: utf8.encode('X') })
  assert.equal(hex(bytes), golden)
})

test('round trips every shape the socket sends', () => {
  const cases: Envelope[] = [
    { id: 1, kind: Kind.request, method: 'hello', payload: utf8.encode('{"binary":false}') },
    { id: 0, kind: Kind.response, method: '', payload: utf8.encode('{"result":"hello"}') },
    { id: 4294967295, kind: Kind.push, method: 'tx', payload: utf8.encode('[]') },
    { id: 7, kind: Kind.request, method: 'findAll', payload: new Uint8Array(0) },
  ]
  for (const c of cases) {
    const back = decode(encode(c))
    assert.ok(back, 'decodes')
    assert.equal(back.id, c.id)
    assert.equal(back.kind, c.kind)
    assert.equal(back.method, c.method)
    assert.deepEqual(Array.from(back.payload), Array.from(c.payload))
  }
})

test('refuses bytes that are not a frame', () => {
  assert.equal(decode(new Uint8Array(0)), null)
  assert.equal(decode(utf8.encode('not a zap frame at all')), null)
})
