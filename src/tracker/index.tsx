import { useBoard } from '~/serve'
import { Board } from './board/Board.tsx'
import { pending } from './board/fixture.ts'

/**
 * The Issues screen.
 *
 * It chooses the board's source and nothing else. `?state=loading|failure|
 * empty|minimal|realistic` names a fixture, which is how each of those is
 * reviewed on purpose rather than whenever the backend happens to produce it.
 *
 * It chooses the board's source and nothing else.
 *
 * The source is always the space plane, and `?state=` is answered by the PLANE
 * rather than here — one fixture world for the whole screen, so the board and
 * the inbox beside it are never two different fictions. Before a space is open
 * there is no source at all, and the board is held at loading rather than shown
 * an empty one: a board with no columns because nothing has answered looks
 * exactly like a board with no columns because the space has none.
 */
export const Tracker = () => {
  const source = useBoard() ?? pending()

  return <Board source={source} />
}
