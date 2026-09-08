# Who owns what

Several agents build this app at once. A file has one owner. Touch only yours;
never reformat a file you do not own; commit only your own paths.

| path | owner | what it is |
|---|---|---|
| `src/shell/**` | frame | the rail, the navigator frame, the panel geometry, the aside |
| `src/tracker/**` | board | the Issues board: breadcrumb, tabs, columns, cards, inbox |
| `src/chat/**` | chat | channels, the message view, the composer |
| `src/data/**` | data | the one client: HTTP over `/v1/team/*` and the transactor socket |
| root config, `src/main.tsx`, `src/app.tsx`, `src/routes.tsx`, `src/theme/**` | scaffold | shared; change by agreement, keep the signatures |

## The seams

Three interfaces hold the regions apart. They are small on purpose.

**The shell takes its regions as props.** `Shell` does not know what a navigator
contains and a navigator does not know it is inside a shell.

```tsx
<Shell nav={<ChannelNav />} aside={<Inbox />}>
  <ChannelView id={id} />
</Shell>
```

`aside` absent means the main region grows into the space. That is the whole
dismiss behaviour; no region implements it twice.

**A route names a pair.** `src/routes.tsx` is the only module that knows both a
navigator and a view, and it is deliberately the smallest file in the tree.

**Data has one door.** `src/data` owns every request and the socket. A region
imports from it and never constructs a URL, a token or a WebSocket of its own.

## gui style props — the shorthand map, measured

Read out of `@hanzogui/config` v5-base at 8.3.1, not guessed. There are 33 and
these are the ones this app uses. Full CSS names always work; the shorthand is
the only *short* spelling, and a shorthand that is not on this list is a type
error rather than a silent no-op — which is the good outcome, so do not reach
for `br`, `ai`, `jc`, `w` or `h`. They do not exist here.

```
bg      backgroundColor        p/px/py/pt/pb/pl/pr   padding…
rounded borderRadius           m/mx/my/mt/mb/ml/mr   margin…
minW    minWidth               maxW  maxWidth
minH    minHeight              maxH  maxHeight
items   alignItems             justify  justifyContent
grow    flexGrow               shrink   flexShrink
self    alignSelf              content  alignContent
text    textAlign              select   userSelect
t/b/l/r top/bottom/left/right  z        zIndex
```

`width`, `height`, `flex`, `gap`, `overflow`, `borderWidth`, `borderColor`,
`position` have no shorthand — write them out.

## The colour roles

`@hanzo/design` names its surfaces rather than numbering them, and gui resolves
the names. Use these, never a hex:

```
$background  the app ground — the rail and the navigator sit directly on it
$panel       a raised sheet — the board, the aside
$raised      an object on a sheet — a card, an unread row
$edge        every hairline, one token at one alpha over whatever is beneath it
$ink         primary text        $quiet  secondary text
$dim         muted text          $faint  the quietest step
$good $bad   the two state hues
```

Three surface rungs and no more. Raising something one level is how this design
says "this is an object"; a fourth grey is how it stops saying it.
