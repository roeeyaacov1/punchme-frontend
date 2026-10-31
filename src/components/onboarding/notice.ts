/**
 * Room for a notice's button on a phone. At 320px with 200% text, the sides
 * that large text doubles (the page's, the step's panel's, the notice's and
 * the button's) took 288px of the 320, leaving a notice 110px for a button
 * that needs 197. These hold the panel's, the notice's and the button's sides
 * at their 100% widths, so nothing changes at 100%, and the button's words
 * wrap: "Choose the picture again" is wider than a 320px phone leaves beside
 * the icon even at 100%.
 */
export const noticePanelSides = "px-[min(1.25rem,20px)] py-5 sm:p-6";
export const noticeSides = "max-sm:px-[min(1rem,16px)]";
export const noticeButton = "max-w-full !whitespace-normal !px-[min(1.25rem,20px)] text-center";
