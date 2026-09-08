/**
 * The Inbox, as the rest of the app sees it.
 *
 *   <Inbox/>     the panel. The shell renders it as `aside`; it takes no
 *                props, because a panel that reads its own feed and then also
 *                took it as a prop would have two answers to one question.
 *   useUnseen()  how many are unread, for the rail's bell. Whoever is mounted
 *                for the life of the app passes it to the shell's
 *                `setNotices`; this region does not import the rail.
 *   serve()      hand the feed a backend. One call from `src/serve.tsx`;
 *                nothing else in this region moves.
 *   arrive()     one notification pushed over the socket while the panel is up.
 *
 * Whether the panel SHOWS is not here: that is `useAside`/`hideAside` in
 * `~/shell`, which also decides beside-main or over it, and one boolean with
 * two homes is how a bell and a × stop agreeing.
 */
export { Inbox } from './Inbox.tsx'
export { arrive, serve, useUnseen } from './feed.ts'
export type { Kind, Note, Person, Source, Span } from './note.ts'
