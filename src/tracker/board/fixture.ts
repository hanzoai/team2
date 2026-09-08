import type { Source } from './model.ts'

/**
 * A source that never answers, so the board holds at loading.
 *
 * The fixture WORLD — the issues, the people, the five named states behind
 * `?state=` — lives in `src/data` and is shared with every other region, so the
 * board and the inbox beside it are never two different fictions. This is the
 * one thing that world cannot express: no space is open yet, so there is
 * nothing to read and nothing to say about it either.
 *
 * Loading rather than empty, deliberately. A board with no columns because
 * nothing has answered looks exactly like a board with no columns because the
 * space has none, and only one of those is worth showing a person.
 */
export const pending = (): Source => ({
  watch: () => () => {},
  move: async () => {},
  add: async () => {},
})
