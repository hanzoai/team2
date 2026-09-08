/**
 * THE COMPOSER — the one control in this product that is a pill.
 *
 * It is the one thing the reference's collaboration capture draws in full: a
 * full-width rounded field with a muted placeholder and the send mark at its
 * right end, with no visible border and no label. So the shape is ported and
 * the colour is ours.
 *
 * It grows with what is typed and stops. A field that grows forever pushes the
 * conversation off the top of its own screen, and one that never grows hides
 * the third line of what somebody is about to send.
 */
import { SizableText, Textarea, XStack, YStack } from '@hanzo/ui'
import { ArrowUp } from '@hanzogui/lucide-icons-2'
import { useState } from 'react'

import { press } from '~/shell'
import { paint } from '~/theme/theme.ts'

/**
 * A key, as both halves of the prop's type see one.
 *
 * The handler is typed as an INTERSECTION of a DOM handler and a native one, so
 * a handler has to accept either — which means its parameter must be the wider
 * of the two shapes, not either one of them. A DOM event carries all three
 * fields and a native event carries only the first, hence the optionals.
 */
type Key = { nativeEvent: { key: string }; shiftKey?: boolean; preventDefault?: () => void }

/** One line, and the most it will grow to. Image 68 on a marketing crop; here
 *  it is the type's own line box plus the field's padding, so it cannot
 *  disagree with the text inside it. */
const LINE = 22
const PAD = 11
const MIN = LINE + PAD * 2
const MAX = LINE * 8 + PAD * 2

export function Composer({
  placeholder,
  disabled,
  onSend,
}: {
  placeholder: string
  /** Why it cannot be used, said out loud. Absent means it can. */
  disabled?: string
  onSend: (text: string) => Promise<void>
}) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [failed, setFailed] = useState<string | null>(null)

  const ready = text.trim() !== '' && !sending && !disabled

  const send = async () => {
    if (!ready) return
    const said = text
    setSending(true)
    setFailed(null)
    try {
      await onSend(said)
      // Cleared only on success. A message that failed to send is still the
      // only copy of what somebody wrote, and clearing the field destroys it.
      setText('')
    } catch (e: unknown) {
      setFailed(e instanceof Error ? e.message : String(e))
    } finally {
      setSending(false)
    }
  }

  const lines = Math.min(8, text.split('\n').length)
  const height = Math.max(MIN, Math.min(MAX, lines * LINE + PAD * 2))

  return (
    <YStack px={24} pb={16} pt={8} gap={6}>
      {failed ? (
        <SizableText fontSize="$1" style={{ color: paint.alert }}>
          {failed}
        </SizableText>
      ) : null}

      <XStack
        items="flex-end"
        gap={8}
        pl={16}
        pr={6}
        py={5}
        rounded={MAX}
        bg="$raised"
        borderWidth={1}
        borderColor="$edge"
        opacity={disabled ? 0.6 : 1}
        focusWithinStyle={{ borderColor: '$bound' }}
      >
        <Textarea
          flex={1}
          unstyled
          // The primitive defaults to three rows, which outgrew every height
          // this component asked for. One row, and the height below decides.
          rows={1}
          height={height}
          // `Textarea` carries its own `min-height: 64px`, which outranks a
          // height and made every composer two lines tall whatever was in it.
          minH={height}
          maxH={MAX}
          py={PAD}
          borderWidth={0}
          bg="transparent"
          fontSize="$3"
          lineHeight={LINE}
          color="$ink"
          placeholderTextColor="$placeholderColor"
          placeholder={disabled ?? placeholder}
          value={text}
          disabled={Boolean(disabled)}
          aria-label={placeholder}
          onChangeText={setText}
          // Enter sends and Shift+Enter breaks the line, which is what every
          // conversation surface does and therefore what fingers expect.
          //
          // `keydown`, not `keypress`. Measured: a `keypress` handler on this
          // control never ran for Enter, so the key fell through to the
          // textarea's own default and typed a newline into the field somebody
          // had just tried to send.
          onKeyDown={(e: Key) => {
            if (e.nativeEvent.key !== 'Enter' || e.shiftKey) return
            e.preventDefault?.()
            void send()
          }}
        />

        <YStack
          aria-disabled={!ready}
          {...press(() => void send(), 'Send')}
          cursor={ready ? 'pointer' : 'default'}
          width={32}
          height={32}
          items="center"
          justify="center"
          rounded={16}
          style={{ background: ready ? paint.accent : undefined }}
          bg={ready ? undefined : '$hover'}
          opacity={ready ? 1 : 0.5}
          focusVisibleStyle={{ outlineColor: '$outlineColor', outlineWidth: 2, outlineStyle: 'solid' }}
        >
          <ArrowUp size={17} color={ready ? '$background' : '$soft'} />
        </YStack>
      </XStack>
    </YStack>
  )
}
