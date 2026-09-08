import { useSearchParams } from 'react-router'
import { useBoard } from '~/serve'
import { Board } from './board/Board.tsx'
import { named, pending } from './board/fixture.ts'

/**
 * The Issues screen.
 *
 * It chooses the board's source and nothing else. `?state=loading|failure|
 * empty|minimal|realistic` names a fixture, which is how each of those is
 * reviewed on purpose rather than whenever the backend happens to produce it.
 *
 * With no `?state=` the board reads the space plane, which is `src/data`'s to
 * open — so this file names an interface and never a socket. Before a space is
 * open there is no source, and the board is held at loading rather than shown
 * an empty one: a board with no columns because nothing has answered looks
 * exactly like a board with no columns because the space has none.
 */
export const Tracker = () => {
  const [query] = useSearchParams()
  const live = useBoard()
  const source = named(query.get('state')) ?? live ?? pending()

  return <Board source={source} />
}
