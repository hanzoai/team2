/**
 * A control that is a button by ROLE and not by tag, pressed either way.
 *
 * gui's stacks render a div, so `role` and `tabIndex` make a control a keyboard
 * reader can reach and NOT one it can press: the browser's own activation
 * belongs to `<button>`, and a press handler only covers the pointer. Measured
 * — Enter on a focused row did nothing at all. Space is included because a
 * button takes Space, and its default is a page scroll, which is why it is
 * refused rather than allowed through.
 *
 * One helper, spread at the call site, so a control cannot be half-built: the
 * role, the stop, the pointer and both keys arrive together or not at all.
 *
 * The event is typed by what this reads rather than by naming gui's shape: a
 * handler that asks for less than it is given is assignable to a prop that
 * offers more, and restating a fifteen-field cross-platform event here would be
 * a copy that goes stale.
 */
type Press = { nativeEvent: { key: string }; preventDefault: () => void }

export const press = (act: () => void, label?: string) => ({
  role: 'button' as const,
  tabIndex: 0,
  cursor: 'pointer' as const,
  ...(label ? { 'aria-label': label } : {}),
  onPress: act,
  onKeyDown: (e: Press) => {
    if (e.nativeEvent.key !== 'Enter' && e.nativeEvent.key !== ' ') return
    e.preventDefault()
    act()
  },
})
