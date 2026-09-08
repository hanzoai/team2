/**
 * The wire's text format, both directions.
 *
 * A message is stored as markup — the platform's `TypeMarkup` — and the server
 * writes it as one escaped `<p>` per non-empty line (cloud `apps/team/chat.go`,
 * `htmlMarkup`). Reading it back is that function inverted, and both halves are
 * here so they cannot drift into two different ideas of what a line is.
 *
 * Lines, not a string with newlines in it: a renderer that receives one string
 * has to split it again, and the two splits then disagree about a trailing
 * blank. The wire's own unit is the paragraph, so that is the unit here.
 */

/** Markup to the lines a reader sees. Empty markup is no lines, never `['']`. */
export const lines = (markup: string): string[] =>
  markup
    .replace(/<\/(p|div|li|h[1-6])>|<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .split('\n')
    .map((l) => unescape(l).trim())
    .filter((l) => l !== '')

/** The lines a person typed, back to the markup the platform stores. */
export const markup = (text: string): string =>
  text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trimEnd())
    .filter((l) => l !== '')
    .map((l) => `<p>${escape(l)}</p>`)
    .join('') || '<p></p>'

const entities: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&#34;': '"',
  '&nbsp;': ' ',
}

// `&amp;` last would double-decode `&amp;lt;` into `<`. One pass over the
// alternation instead, so every entity is read exactly once.
const unescape = (s: string): string =>
  s.replace(/&(?:amp|lt|gt|quot|nbsp|#39|#34);/g, (m) => entities[m] ?? m)

const escape = (s: string): string =>
  s.replace(/[&<>"']/g, (c) => `&${{ '&': 'amp', '<': 'lt', '>': 'gt', '"': 'quot', "'": '#39' }[c]};`)

/**
 * What a line is made of.
 *
 * A mention and a link are the two things inside a message that are not prose,
 * and both are drawn differently — so the split happens once, here, rather than
 * in the component with a regex per render.
 */
export type Token =
  | { kind: 'text'; value: string }
  | { kind: 'mention'; value: string }
  | { kind: 'link'; value: string }

// A mention runs to the first character that cannot be in a handle. `@everyone`
// is not special here: it is a handle like any other, and what it MEANS is the
// notification plane's question, not the renderer's.
//
// The `@` must OPEN a word. Without that, `z@hanzo.ai` reads as a mention of
// `@hanzo.ai` — so every email address in a conversation became a highlighted
// mention of a person who does not exist.
const pattern = /(?<![\w.@-])(@[\w.-]+)|(https?:\/\/[^\s<>()]+)/g

export const tokens = (line: string): Token[] => {
  const out: Token[] = []
  let at = 0
  for (const m of line.matchAll(pattern)) {
    const i = m.index
    if (i > at) out.push({ kind: 'text', value: line.slice(at, i) })
    out.push(m[1] ? { kind: 'mention', value: m[1] } : { kind: 'link', value: m[2] })
    at = i + m[0].length
  }
  if (at < line.length) out.push({ kind: 'text', value: line.slice(at) })
  return out
}
