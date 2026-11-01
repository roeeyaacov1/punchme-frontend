/** The wizard's column: one 32rem column on a phone, a tablet, and wherever
 * large text leaves no room for two (`useWide`); then wide enough for the
 * step and the card side by side. The top bar, the page and the docked
 * action all stand on it, so they line up. */
export const column = (wide: boolean) => `mx-auto w-full px-4 ${wide ? "max-w-[62rem]" : "max-w-lg"}`;
