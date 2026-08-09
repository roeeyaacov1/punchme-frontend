export interface CardPalette {
  key: string;
  background: string;
  stamp: string;
  text: string;
  label: string;
}

/** One-click color schemes for the simple editor — tuned for contrast on
 * both wallets (dark text on light cards, light text on dark). */
export const CARD_PALETTES: CardPalette[] = [
  { key: "espresso", background: "#4B2E1E", stamp: "#FFFFFF", text: "#FFFFFF", label: "#D2B48C" },
  { key: "cream", background: "#F5EFE6", stamp: "#7C5CBF", text: "#1C1C1E", label: "#8A7B66" },
  { key: "midnight", background: "#0E1120", stamp: "#F4C542", text: "#FFFFFF", label: "#9AA3B2" },
  { key: "olive", background: "#3D4A2A", stamp: "#F2E8CF", text: "#FFFFFF", label: "#BFCBA8" },
  { key: "blush", background: "#F9E4E4", stamp: "#C4356B", text: "#40232B", label: "#A96A7B" },
  { key: "ocean", background: "#12455F", stamp: "#63D2E2", text: "#FFFFFF", label: "#9FC6D4" },
];
