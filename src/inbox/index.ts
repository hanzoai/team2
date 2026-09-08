/**
 * The Inbox, as the rest of the app sees it.
 *
 *   <Inbox/>   the panel. The shell renders it as `aside`; it takes no props,
 *              because a panel that reads its own feed and then also took it as
 *              a prop would have two answers to one question.
 *   useOpen()  whether to render it. `setOpen` and `toggle` write, and the
 *              choice survives a reload.
 *   serve()    hand the feed a backend. One call from `src/data` when a
 *              transactor client exists; nothing else in this region moves.
 *   arrive()   one notification pushed over that socket while the panel is up.
 */
export { Inbox } from './Inbox.tsx'
export { arrive, serve } from './feed.ts'
export type { Kind, Note, Person, Source, Span } from './note.ts'
export { setOpen, toggle, useOpen } from './open.ts'
