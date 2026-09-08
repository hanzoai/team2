/**
 * THE RAIL — the app's spine: the mark, the gauge, the bell, one glyph per
 * surface, and the control that would add another.
 *
 * The selected surface is a SOFT GLOW behind its glyph and a brighter glyph, not
 * a plate and not a pill. Measured: across the rail's whole width the luminance
 * rises smoothly out of the ground over ~35px on every side of the icon, with no
 * edge anywhere, which is a radial gradient and not a rectangle. A plate here
 * reads as a different product, and it is the one thing about this column
 * somebody will get wrong.
 */
import { Progress, Separator, SizableText, Tooltip, TooltipContent, TooltipTrigger, XStack, YStack } from '@hanzo/ui'
import { HanzoMark } from '@hanzo/ui/product'
import { Bell, Plus } from '@hanzogui/lucide-icons-2'
import type { ReactNode } from 'react'
import { useLocation } from 'react-router'

import { useNotices, useTodo } from './counts.ts'
import { ADD, GAUGE, GLOW, ICON, MARK, PAD, RAIL, STEP } from './measure.ts'
import { SURFACES } from './surfaces.ts'
import { caps, paint, round, rung } from '~/theme/theme'

const RING = { outlineColor: '$outlineColor', outlineWidth: 2, outlineStyle: 'solid' } as const

/** The glow behind the selected glyph, from the same surface rung a raised thing
 *  uses — so it lifts with the theme rather than being a colour of its own. */
const HALO = { background: 'radial-gradient(closest-side, var(--surface-3, rgb(255 255 255 / .12)), transparent)' }

/** The one hue gui has no token for. Addressed-to-you is a categorical colour and
 *  it is `~/theme`'s, so it arrives as CSS rather than as a prop. */
const DOT = { background: paint.alert }

export type RailProps = {
  /** Whether the aside is showing, so the bell can say so. */
  notices: boolean
  onNotices: () => void
  /** The shell decides what a surface tap means: at this width it may open the
   *  navigator's drawer rather than go where you already are. */
  onSurface: (path: string) => void
}

export const Rail = ({ notices, onNotices, onSurface }: RailProps) => {
  const { pathname } = useLocation()
  const waiting = useNotices()

  return (
    <YStack
      width={RAIL}
      shrink={0}
      height="100%"
      items="center"
      pt={20}
      bg="$background"
      borderRightWidth={1}
      borderColor="$edge"
      data-parity-key="shell.rail"
    >
      <YStack width={MARK} height={MARK} rounded="$5" items="center" justify="center" bg="$hover">
        <HanzoMark size={22} />
      </YStack>

      <YStack height={20} />
      <Gauge />
      <YStack height={28} />

      <Slot label={notices ? 'Hide notices' : 'Show notices'} here={notices} onPress={onNotices}>
        <Bell size={ICON} color={notices ? '$ink' : '$soft'} />
        {waiting > 0 ? (
          <YStack
            position="absolute"
            t={(STEP - ICON) / 2 - 1}
            r={(STEP - ICON) / 2 - 1}
            width={7}
            height={7}
            rounded={round.pill}
            style={DOT}
          />
        ) : null}
      </Slot>

      <Rule />

      {SURFACES.map((s) => {
        const here = pathname === s.path || pathname.startsWith(`${s.path}/`)
        return (
          <Slot key={s.id} label={s.label} here={here} onPress={() => onSurface(s.path)}>
            <s.icon size={ICON} color={here ? '$ink' : '$soft'} />
          </Slot>
        )
      })}

      <Rule />

      <Tooltip>
        <TooltipTrigger>
          <YStack
            width={ADD}
            height={ADD}
            mt={4}
            rounded={round.pill}
            borderWidth={1}
            borderStyle="dashed"
            borderColor="$edge"
            items="center"
            justify="center"
            opacity={0.5}
            aria-disabled
            aria-label="Add an app"
          >
            <Plus size={16} color="$soft" />
          </YStack>
        </TooltipTrigger>
        <TooltipContent>There are no apps to add yet.</TooltipContent>
      </Tooltip>
    </YStack>
  )
}

const Rule = () => <Separator width={RAIL - PAD * 2} my={12} borderColor="$edge" />

/** One place in the icon column: the touch target, the glow, and the glyph. */
const Slot = ({ label, here, onPress, children }: {
  label: string
  here: boolean
  onPress: () => void
  children: ReactNode
}) => (
  <Tooltip>
    <TooltipTrigger>
      <YStack
        role="button"
        tabIndex={0}
        aria-label={label}
        aria-current={here ? 'page' : undefined}
        cursor="pointer"
        width={STEP}
        height={STEP}
        items="center"
        justify="center"
        position="relative"
        rounded={round.field}
        onPress={onPress}
        focusVisibleStyle={RING}
      >
        {here ? (
          <YStack position="absolute" width={GLOW} height={GLOW} style={HALO} pointerEvents="none" />
        ) : null}
        {children}
      </YStack>
    </TooltipTrigger>
    <TooltipContent>{label}</TooltipContent>
  </Tooltip>
)

/**
 * THE GAUGE — how much of the work is still to do, as one figure.
 *
 * The reference draws it in the source brand's coral over a halftone field. The
 * texture is that brand's and does not come; the METER does, because it is what
 * the widget IS — a capsule that fills to the value with the figure over it.
 *
 * `null` is an em-dash, not a zero. Nothing to measure is not "0% to do", and a
 * gauge that invents a number is the one thing a gauge may not do. The number
 * arrives through `setTodo` from whoever holds the work; the rail has no data of
 * its own and cannot answer for a region it does not own.
 */
const Gauge = () => {
  const todo = useTodo()
  return (
    <YStack
      width={GAUGE.width}
      height={GAUGE.height}
      rounded="$5"
      borderWidth={1}
      borderColor="$edge"
      bg="$panel"
      overflow="hidden"
      px={8}
      py={10}
      aria-label={todo === null ? 'Nothing to do' : `${todo}% to do`}
    >
      <YStack position="absolute" l={0} r={0} b={0} height={`${todo ?? 0}%`} bg="$hover" pointerEvents="none" />

      <XStack items="flex-start" gap={1}>
        <SizableText fontSize={rung.figure} lineHeight={32} fontWeight="500" color="$ink">
          {todo ?? '—'}
        </SizableText>
        {todo === null ? null : (
          <SizableText fontSize={rung.chip} lineHeight={14} color="$soft">
            %
          </SizableText>
        )}
      </XStack>

      <YStack height={8} />
      <Progress value={todo ?? 0} height={4} width={GAUGE.width - 32} />

      <YStack flex={1} />

      <SizableText {...caps} fontSize={rung.chip} fontWeight="600" color="$ink">
        To do
      </SizableText>
    </YStack>
  )
}
