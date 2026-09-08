/**
 * SHELL GEOMETRY — every number the four regions are built from, and the one
 * decision the rest descend from.
 *
 * THE SCALE. The reference is a 2048×1138 render at an arbitrary scale, so its
 * pixels are not CSS pixels and only the ratios are the contract. The scale is a
 * DECISION and it is 1.5: eight independently measured cap heights (12 13 14 15
 * 16 22 23 39 image px) divided by 1.5 and by a grotesque's 0.727 cap ratio land
 * on 11 13 14 15 21 36 — four of them exactly on rungs the ladder already
 * publishes ($1 11 · $2 13 · $3 14 · $7 21), with nothing to round. 1.6 lands
 * none of them. So: image px ÷ 1.5, snapped to the 4px ramp, and where the two
 * disagree the RAMP wins — a rhythm 2px off reads as this product, one off the
 * ramp reads as none.
 *
 * Every number carries the image measurement it came from, so a remeasurement
 * can be checked against the same evidence rather than argued.
 */

/** Image px per CSS px. Recorded so the derivation can be replayed. */
export const SCALE = 1.5

// ── the four regions ─────────────────────────────────────────────────────────
// Seams measured off flat background runs, so they are exact: the rail's
// hairline at image x124, the navigator ending at 439, the board at 1559, the
// aside spanning 1568–2027. Three are FIXED and the board absorbs every change
// of width — the reference proves it by cutting its fourth column mid-card
// rather than reflowing, so the board scrolls sideways and never re-wraps.

/** The icon rail. Image 124. Fixed at every width, including the narrowest: it
 *  is how you leave the screen you are on. */
export const RAIL = 84
/** The navigator. Image 314. Fixed, dragged by the grip, a drawer when there is
 *  no room for it. */
export const NAV = 208
export const NAV_MIN = 168
export const NAV_MAX = 360
/** The dismissible right panel. Image 1568..2040, so 472 — which puts its left
 *  edge at 1045 in CSS px, where the reference draws it. */
export const ASIDE = 312

/** Ground showing between the raised panels, and around them. The reference
 *  draws three widths there (8 between, 16 above, 20 outside); one value here,
 *  because a seam with three widths is three seams. */
export const SEAM = 8

// ── inside a region ──────────────────────────────────────────────────────────

/** Panel padding: the navigator and the aside alike. Image 24–26. */
export const PAD = 16

/** A navigator row: a standing entry or a project. Image pitch 55 and 60. */
export const ROW = 36
/** A row under an expanded project. Image pitch 47. */
export const LEAF = 32
/** The rail's icon pitch, image 64, which is also the touch minimum. */
export const STEP = 44
/** Every glyph in the rail and the navigator. Image 24–32. */
export const ICON = 20
/** The search field. Image 52. */
export const FIELD = 36

/** The rail's mark. Image 66. */
export const MARK = 44
/** The rail's gauge. Image 90×225. */
export const GAUGE = { width: 60, height: 150 }
/** The rail's add control, and the glow behind the selected glyph. Image 56, ~100. */
export const ADD = 36
export const GLOW = 68

/** Where a row's label starts, and where the tree's spine runs. Padding, the
 *  icon box, then the gap — so a row with no glyph indents to the same place and
 *  a spine at the glyph's centre passes through every glyph above it. Measured:
 *  label x192 and spine x165 in image space, against 44 and 26 here. */
export const LABEL = PAD + ICON + 8
export const SPINE = PAD + ICON / 2

// ── where the layout gives up a region ───────────────────────────────────────
// OURS BY DESIGN. The reference is one width and shows no breakpoint, so nothing
// here is measured. The numbers are what the regions need rather than device
// classes: four inline needs rail 84 + navigator 208 + two board columns 480 +
// aside 308 + seams; the navigator inline needs the first three.
//
// WIDTH COMES FROM THE SHELL, NOT THE WINDOW. What a region has to fit in is
// this element's width, which a desktop shell can make smaller than the viewport
// and which a media query cannot see.

export const INLINE_ASIDE = 1120
export const INLINE_NAV = 800
