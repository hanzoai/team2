import { deepEqual, equal } from 'node:assert/strict'
import { test } from 'node:test'

import { lines, markup, tokens } from './text.ts'

test('markup is one escaped paragraph per non-empty line', () => {
  equal(markup('one\ntwo'), '<p>one</p><p>two</p>')
  equal(markup('a\n\n\nb'), '<p>a</p><p>b</p>')
  equal(markup('trailing   \n'), '<p>trailing</p>')
  // Empty input still has to be valid markup, never an empty string.
  equal(markup(''), '<p></p>')
  equal(markup('   '), '<p></p>')
})

test('markup escapes what would otherwise be read as markup', () => {
  equal(markup('<b>x</b> & "y" \'z\''), '<p>&lt;b&gt;x&lt;/b&gt; &amp; &quot;y&quot; &#39;z&#39;</p>')
})

test('lines inverts markup', () => {
  deepEqual(lines('<p>one</p><p>two</p>'), ['one', 'two'])
  deepEqual(lines(markup('one\ntwo')), ['one', 'two'])
  deepEqual(lines('<p></p>'), [])
  deepEqual(lines(''), [])
})

test('lines reads what the server writes, entities and all', () => {
  deepEqual(lines('<p>&lt;b&gt; &amp; &quot;q&quot;</p>'), ['<b> & "q"'])
  // `&amp;lt;` is an escaped `&lt;`, and one pass is what keeps it one.
  deepEqual(lines('<p>&amp;lt;</p>'), ['&lt;'])
  deepEqual(lines('<p>a<br/>b</p>'), ['a', 'b'])
})

test('lines survives markup this app did not write', () => {
  deepEqual(lines('<div>a</div><ul><li>b</li></ul>'), ['a', 'b'])
  deepEqual(lines('<p><strong>bold</strong> rest</p>'), ['bold rest'])
})

test('tokens splits mentions and links out of prose', () => {
  deepEqual(tokens('hi @mark see https://x.dev ok'), [
    { kind: 'text', value: 'hi ' },
    { kind: 'mention', value: '@mark' },
    { kind: 'text', value: ' see ' },
    { kind: 'link', value: 'https://x.dev' },
    { kind: 'text', value: ' ok' },
  ])
})

test('tokens leaves prose alone and keeps every character', () => {
  deepEqual(tokens('nothing special'), [{ kind: 'text', value: 'nothing special' }])
  for (const line of ['@a', 'x@a', '@a@b', 'a @b.c-d e', 'https://x/?q=1&z=2']) {
    equal(tokens(line).map((t) => t.value).join(''), line)
  }
})

test('an email is not a mention', () => {
  // The handle must start the run; `z@hanzo.ai` is one text token, not a
  // mention of `@hanzo.ai`.
  deepEqual(tokens('z@hanzo.ai'), [{ kind: 'text', value: 'z@hanzo.ai' }])
})
