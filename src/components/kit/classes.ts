/**
 * Class strings every kit primitive shares.
 *
 * Plain constants in a `.ts` file, so react-refresh has nothing to warn
 * about, and full literal class names, because Tailwind only ships a class
 * it can find written out whole.
 */

/**
 * The focus ring: 2px of ink at a 2px offset, as `focusRing` has always
 * been, but drawn as an outline rather than a box-shadow ring.
 *
 * Three reasons. An outline never shares `box-shadow` with a panel's
 * shadow, so a theme can't switch one off by switching off the other. Its
 * gap is transparent, where a ring's offset is painted in the wall colour
 * and shows as a halo on a lit panel. And it survives Windows' high-contrast
 * mode, which drops box-shadows. Ink measures 13.54:1 on the wall and 14.88:1
 * on a panel, 16.33:1 and 14.92:1 at night, and 13.91:1 on a lit panel.
 */
export const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

/** The same ring inside the edge, for a row whose panel would clip it. */
export const focusRingInset =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ink";

/** No grey flash under a finger on a tapped control. */
export const noTapFlash = "[-webkit-tap-highlight-color:transparent]";

/**
 * A link inside running text: ink, underlined, because Lightbox has no
 * accent colour for text — coral as text would read as an error.
 */
export const linkText = `rounded-sm text-ink underline decoration-1 underline-offset-[3px] hover-fine:decoration-2 ${focusRing}`;

/**
 * A text field's box: the 3:1 field edge, 16px corners, and 16px text so
 * iOS doesn't zoom the page when it takes focus. An error turns the edge
 * red (5.79:1 on the wall) and the field carries its words beside it. No
 * hover tint: it would sort after the error and hide the red edge under a
 * pointer.
 */
export const fieldBox = `w-full rounded-field border border-field bg-surface px-4 text-base text-ink placeholder:text-ink-subtle disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-danger ${noTapFlash} ${focusRing}`;
