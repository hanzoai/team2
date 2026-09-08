/**
 * The ZAP envelope, byte for byte.
 *
 * Every frame on the transactor socket is one ZAP Envelope carrying one
 * JSON-RPC message. This is a port of the codec in cloud `apps/team/envelope.go`
 * and it is held to it by the golden in `zap.test.ts` — the same hex that Go's
 * own `TestGoldenHex` asserts, so the two implementations cannot drift without
 * one of the two suites going red.
 *
 * Layout (little-endian):
 *
 *   header[16]  "ZAP\0" | version u16=2 | flags u16=0 | rootOffset u32=16 | size u32
 *   object @16  fixed section, 24 bytes:
 *               id      @0   u32
 *               kind    @4   u8   (0 request · 1 response · 2 push)
 *               method  @8   ptr  (relOffset u32 @8,  length u32 @12)
 *               payload @16  ptr  (relOffset u32 @16, length u32 @20)
 *               then the method bytes, then the payload bytes.
 *
 * A pointer's offset is relative to ITS OWN field position, not to the start of
 * the frame — which is the one detail a reimplementation gets wrong and which
 * the golden catches. An empty value is (0, 0) with no bytes appended.
 */

export const Kind = { request: 0, response: 1, push: 2 } as const
export type Kind = (typeof Kind)[keyof typeof Kind]

export type Envelope = {
  id: number
  kind: Kind
  method: string
  payload: Uint8Array
}

const HEADER = 16
const ROOT = 16
const FIXED = 24
const START = ROOT + FIXED // 40 — where the variable section begins

const F_ID = 0
const F_KIND = 4
const F_METHOD = 8
const F_PAYLOAD = 16

const utf8 = new TextEncoder()
const text = new TextDecoder()

export const encode = (e: Envelope): Uint8Array => {
  const method = utf8.encode(e.method)
  const payload = e.payload

  let pos = START
  const methodAt = pos
  const methodRel = method.length > 0 ? pos - (ROOT + F_METHOD) : 0
  if (method.length > 0) pos += method.length
  const payloadAt = pos
  const payloadRel = payload.length > 0 ? pos - (ROOT + F_PAYLOAD) : 0
  if (payload.length > 0) pos += payload.length

  const buf = new Uint8Array(pos)
  const view = new DataView(buf.buffer)
  buf.set(utf8.encode('ZAP\0'), 0)
  view.setUint16(4, 2, true) // version
  view.setUint16(6, 0, true) // flags
  view.setUint32(8, ROOT, true)
  view.setUint32(12, pos, true)

  view.setUint32(ROOT + F_ID, e.id, true)
  buf[ROOT + F_KIND] = e.kind
  view.setUint32(ROOT + F_METHOD, methodRel, true)
  view.setUint32(ROOT + F_METHOD + 4, method.length, true)
  view.setUint32(ROOT + F_PAYLOAD, payloadRel, true)
  view.setUint32(ROOT + F_PAYLOAD + 4, payload.length, true)

  buf.set(method, methodAt)
  buf.set(payload, payloadAt)
  return buf
}

/** Null when the bytes are not a ZAP frame. The socket ignores those. */
export const decode = (data: Uint8Array): Envelope | null => {
  if (data.length < HEADER) return null
  if (text.decode(data.subarray(0, 4)) !== 'ZAP\0') return null
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength)
  const root = view.getUint32(8, true)
  if (root < HEADER || root + FIXED > data.length) return null
  return {
    id: view.getUint32(root + F_ID, true),
    kind: data[root + F_KIND] as Kind,
    method: text.decode(pointer(data, view, root + F_METHOD)),
    payload: pointer(data, view, root + F_PAYLOAD).slice(),
  }
}

/** Reads a (relOffset, length) forward pointer. relOffset 0 is empty. */
const pointer = (data: Uint8Array, view: DataView, at: number): Uint8Array => {
  if (at + 8 > data.length) return new Uint8Array(0)
  const rel = view.getUint32(at, true)
  if (rel === 0) return new Uint8Array(0)
  const length = view.getUint32(at + 4, true)
  const abs = at + rel
  if (abs < HEADER || abs + length > data.length) return new Uint8Array(0)
  return data.subarray(abs, abs + length)
}

/** A frame carrying one JSON value as its payload. */
export const frame = (id: number, kind: Kind, method: string, value: unknown): Uint8Array =>
  encode({ id, kind, method, payload: utf8.encode(JSON.stringify(value)) })

/** The payload of a frame, as text. Heartbeats ride here as bare words. */
export const body = (e: Envelope): string => text.decode(e.payload)
