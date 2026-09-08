/**
 * A control that is a button by ROLE and not by tag, pressed either way.
 *
 * gui's stacks render a div, so `role="button"` and `tabIndex` make a control a
 * keyboard reader can reach and NOT one it can press: the browser's own
 * activation belongs to `<button>`, and `onPress` only covers the pointer.
 * Measured — Enter on a focused row did nothing at all.
 *
 * Spread it instead of writing `onPress`, and the two halves cannot drift
 * apart. Space is included because a button takes Space, and its default is a
 * page scroll, which is why it is refused rather than allowed through.
 *
 * The event is typed by what this reads rather than by naming gui's shape: a
 * handler that asks for less than it is given is assignable to a prop that
 * offers more, and restating a fifteen-field cross-platform event here would be
 * a copy that goes stale.
 */
type Press = { nativeEvent: { key: string }; preventDefault: () => void }

export const press = (act: () => void) => ({
  onPress: act,
  onKeyDown: (e: Press) => {
    if (e.nativeEvent.key !== 'Enter' && e.nativeEvent.key !== ' ') return
    e.preventDefault()
    act()
  },
})
