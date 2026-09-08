import type { Source } from './model.ts'

/**
 * What a board reads before it has a plane.
 *
 * There are three answers and they are not interchangeable: still opening, the
 * workspace refused, and a person who belongs to no space at all. A board given
 * one of the others draws an endless skeleton over a refusal, or an empty board
 * over a space nobody has finished opening — and each of those is a screen that
 * says something untrue about the state it is in.
 *
 * The fixture WORLD — the issues, the people, the five named states behind
 * `?state=` — lives in `src/data` and is shared with every other region, so the
 * board and the inbox beside it are never two different fictions. This is the
 * part that world cannot express, because it is about not having reached it.
 */
export type Standby = 'opening' | 'refused' | 'nowhere'

const never = () => new Promise<void>(() => {})

export const standby = (state: Standby): Source => ({
  watch(next, fail) {
    if (state === 'refused') fail(new Error('Your workspace is not answering.'))
    if (state === 'nowhere') next([])
    return () => {}
  },
  move: never,
})

/** Still opening: the board holds at loading, because it has not been told. */
export const pending = (): Source => standby('opening')
