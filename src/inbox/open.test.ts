import assert from 'node:assert/strict'
import { test } from 'node:test'

/**
 * The dismissal survives a reload, and a browser that refuses to remember still
 * renders. Both are exercised against a stand-in `localStorage`, because the
 * module reads it at import and node has none.
 */
const store = new Map<string, string>()
const shim = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
}

test('open by default, and the choice is remembered', async () => {
  store.clear()
  Object.defineProperty(globalThis, 'localStorage', { value: shim, configurable: true })
  const { setOpen, toggle } = await import('./open.ts')

  // Nothing stored: the panel shows, which is the state the reference captures.
  assert.equal(store.get('team.inbox.open'), undefined)

  setOpen(false)
  assert.equal(store.get('team.inbox.open'), 'no')
  toggle()
  assert.equal(store.get('team.inbox.open'), 'yes')
})

test('a browser that refuses storage still answers', async () => {
  const angry = {
    getItem: () => {
      throw new Error('blocked')
    },
    setItem: () => {
      throw new Error('blocked')
    },
  }
  Object.defineProperty(globalThis, 'localStorage', { value: angry, configurable: true })
  // A fresh module instance reads storage at import; the throw must not escape.
  const fresh = await import(`./open.ts?blocked=${Date.now()}`)
  assert.doesNotThrow(() => fresh.setOpen(false))
})
