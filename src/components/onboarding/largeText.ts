/**
 * Room on a phone with large text. At 320px with 200% text, the sides that
 * large text doubles (the page's, a step's panel's, a notice's and a
 * button's) took 288px of the 320, leaving a notice 110px for a button that
 * needs 197. These hold the panel's, the notice's and the button's sides at
 * their 100% widths, so nothing changes at 100%, and let a button's words
 * wrap rather than run past the screen: "Choose the picture again" is wider
 * than a 320px phone leaves beside a notice's icon even at 100%, and "Your
 * business" is wider than the screen at 200%.
 */
export const panelSides = "px-[min(1.25rem,20px)] py-5 sm:p-6";
export const noticeSides = "max-sm:px-[min(1rem,16px)]";
export const wrapButton = "max-w-full !whitespace-normal !px-[min(1.25rem,20px)] text-center";
