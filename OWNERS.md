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

`@hanzo/design` names its surfaces rather than numbering them, and gui resolves
the names. Use these, never a hex:

```
$background  the app ground — the rail and the navigator sit directly on it
$panel       a raised sheet — the board, the aside
$raised      an object on a sheet — a card, an unread row
$edge        every hairline, one token at one alpha over whatever is beneath it
$ink         primary text        $quiet  secondary text
$dim         muted text          $soft   an icon beside a label
$hover       the faint ground under a pointer
$bound       a border that has been reached for
```

Three surface rungs and no more. Raising something one level is how this design
says "this is an object"; a fourth grey is how it stops saying it.

The two ACCENTS have no gui token, because gui does not have this product's
palette. They come from `theme/theme.ts` as `paint.accent` (where you are, how
many) and `paint.alert` (addressed to you), through `style` per the rule above.
