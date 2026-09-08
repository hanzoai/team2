/**
 * A ring that fills clockwise from twelve o'clock.
 *
 * @hanzo/ui publishes `Progress`, which is linear, and `Donut`, which is a
 * 160px chart of segments. This is neither: one value, card-sized, no legend,
 * no label of its own. It is the shape the estate is missing, and it is small
 * enough to promote once a second surface asks for it.
 *
 * The arc is drawn by dashing the circumference rather than by an arc path, so
 * there is no sweep-flag discontinuity at a half turn and no case analysis at
 * the ends: zero is an empty dash and one is a full one.
 */
export const Ring = ({ done, size = 16, width = 2 }: { done: number; size?: number; width?: number }) => {
  const at = Math.min(1, Math.max(0, done))
  const r = (size - width) / 2
  const c = 2 * Math.PI * r

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${Math.round(at * 100)}% done`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={ring.track} strokeWidth={width} />
      {at > 0 ? (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={ring.arc}
          strokeWidth={width}
          strokeLinecap="round"
          strokeDasharray={`${c * at} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      ) : null}
    </svg>
  )
}
