# Who owns what

Several agents build this app at once. A file has one owner. Touch only yours;
never reformat a file you do not own; commit only your own paths.

| path | owner | what it is |
|---|---|---|
| `src/shell/**` | frame | the rail, the navigator frame, the panel geometry, the aside |
| `src/tracker/**` | board | the Issues board: breadcrumb, tabs, columns, cards |
| `src/inbox/**` | inbox | the aside: its tabs, its rows, and the feed behind them |
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

## gui style props — measured, not guessed

The config publishes 33 shorthands, and it OMITS every longhand that has one
(`Omit<StackStyleBase, Longhands>` in the prop type). So a property with a
shorthand must use the shorthand — the full name is a type error, which is the
good outcome, but only if you know why.

```
bg      backgroundColor        p/px/py/pt/pb/pl/pr   padding…
rounded borderRadius           m/mx/my/mt/mb/ml/mr   margin…
minW/minH/maxW/maxH            items    alignItems
grow/shrink  flex…             justify  justifyContent
self    alignSelf              content  alignContent
text    textAlign              select   userSelect
t/b/l/r top/bottom/left/right  z        zIndex
```

Everything WITHOUT a shorthand keeps its full name and is accepted:
`width`, `height`, `flex`, `gap`, `overflow`, `position`, `opacity`, `cursor`,
`borderWidth`, `borderColor`, `borderBottomWidth`, `borderBottomColor`,
`flexWrap`, `fontSize`, `lineHeight`, `fontWeight`, `numberOfLines`.

Three more that cost an hour between us:

- **Inside a pseudo-style object the key is `background`**, not `backgroundColor`
  and not `bg`: `hoverStyle={{ background: '$hover' }}`. A different vocabulary
  from the props, and the compiler is the only thing that says so.
- **A `var(--…)` is not a gui colour token.** `color={paint.alert}` does not
  typecheck and casting it would be a lie the compiler then stops checking.
  Raw CSS values go through `style`, which takes real CSS names:
  `style={{ color: paint.alert }}`.
- **Groups are unnamed here.** `group` is typed `boolean`, so it is
  `<YStack group>` with `$group-hover={{…}}` on a descendant. A named group
  needs a `GroupNames` registration this app has not made.

`Spinner` takes `size` in PIXELS (`size={16}`), never `"small"`. `Textarea` is a
DOM textarea: `disabled`, not `editable`. Its `onKeyPress` is typed as an
INTERSECTION of a DOM and a native handler, so the parameter must be the wider
of the two shapes — see `chat/Composer.tsx`.

## The colour roles

One home: `src/theme/tokens.css` holds the values, `src/theme/theme.ts` holds
the names. A component imports a name and never writes a colour —
`theme.test.ts` reads the whole tree and fails on a hex, an `rgb(` or an
`oklch(` outside the sheet, and fails on a role a component can reach that the
sheet does not declare (an undeclared custom property resolves to nothing and
reports no error, which is how a menu ships transparent).

```
paint.ground   the app — the rail and the navigator sit on it
paint.panel    a raised sheet — the board, the aside
paint.card     an object on a sheet — a card, an unread row
paint.rule     every hairline, one token at one alpha over whatever is beneath
paint.ink      primary   paint.mute  secondary   paint.dim  the quietest step
paint.accent   where you are and how many — active tab, count, progress arc
paint.alert    addressed to you — a mention, the bell, an unread you are named in
state.backlog / state.todo / state.doing / state.done
chip(id) mark(id) rank(priority)   the six-slot categorical ring
rung.* gap.* round.*               which gui `$N` each role lands on
```

Three surface rungs and no more. Raising something one level is how this design
says "this is an object"; a fourth grey is how it stops saying it.

Nearly every value defers to an @hanzo/design token, so light and dark come for
free. The six categorical hues are minted here because design is monochrome by
charter and a board cannot be; their home is design, and they move there when a
second surface needs them.

## Entering a state on purpose

`?state=loading|empty|failure|minimal|realistic` stands in for the WHOLE plane,
not for one region — so the board and the inbox beside it can never be two
different fictions, and it opens the door as well, because a session is part of
the plane. One knob. A region that adds a second one has made a screen that
cannot be captured beside its neighbours.
