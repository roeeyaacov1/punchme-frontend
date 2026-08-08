/**
 * Placeholder wallet marks.
 *
 * TODO(assets): replace both with the official badges before launch —
 *   Apple:  "Add to Apple Wallet" badge, from the Apple Wallet Identity
 *           Guidelines (developer.apple.com/wallet/) → `public/wallet-apple.svg`
 *   Google: "Add to Google Wallet" button asset, from the Google Wallet
 *           brand guidelines → `public/wallet-google.svg`
 * Both are trademark-controlled and have mandatory clear-space and minimum
 * size rules, so they can't be redrawn here — these are neutral card glyphs
 * standing in until the real files are dropped into /public.
 */
function CardGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 24"
      className={className}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <rect
        x="1"
        y="5"
        width="30"
        height="18"
        rx="3.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M5 5V3.5A2.5 2.5 0 0 1 7.5 1h17A2.5 2.5 0 0 1 27 3.5V5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.5"
      />
      <rect x="1" y="10" width="30" height="3" fill="currentColor" opacity="0.35" />
    </svg>
  );
}

export function WalletMark({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-ink-muted">
      <CardGlyph className="h-5 w-auto shrink-0" />
      <span className="text-sm font-medium">{label}</span>
    </span>
  );
}
