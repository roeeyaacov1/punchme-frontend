import { cn } from "../../lib/cn";
import { STAMP_ICONS } from "../../lib/stampIcons";
import { HERO_BACKGROUNDS, isPresetHeroBackground } from "../../lib/heroBackgrounds";

export interface WalletCardPreviewProps {
  backgroundColor: string;
  foregroundColor: string;
  labelColor: string;
  logoUrl?: string;
  businessName: string;
  stampsRequired: number;
  currentStamps?: number;
  rewardDescription: string;
  /** Preset icon key (see src/lib/stampIcons.ts) rendered per stamp instead
   * of a plain circle. Falls back to the circle when unset. */
  stampIcon?: string;
  /** A preset key (src/lib/heroBackgrounds.ts) or an uploaded image URL,
   * rendered behind the stamp row. */
  heroBackground?: string;
}

/**
 * Pure, presentational CSS mock of an Apple/Google Wallet store-card pass.
 * Not a real .pkpass render — reused as-is in the marketing hero, the card
 * designer's live preview, and the dashboard.
 */
export function WalletCardPreview({
  backgroundColor,
  foregroundColor,
  labelColor,
  logoUrl,
  businessName,
  stampsRequired,
  currentStamps = 0,
  rewardDescription,
  stampIcon,
  heroBackground,
}: WalletCardPreviewProps) {
  const stamps = Array.from({ length: Math.max(stampsRequired, 1) });
  const StampIcon = stampIcon ? STAMP_ICONS[stampIcon] : undefined;
  const heroStyle: React.CSSProperties | undefined = !heroBackground
    ? undefined
    : isPresetHeroBackground(heroBackground)
      ? { background: HERO_BACKGROUNDS[heroBackground] }
      : {
          backgroundImage: `url(${heroBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        };

  return (
    <div
      className="w-[320px] rounded-[28px] overflow-hidden shadow-[0_20px_50px_rgba(14,17,32,0.25)]"
      style={{ backgroundColor }}
    >
      <div className="p-5 flex flex-col gap-5" style={{ color: foregroundColor }}>
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-white/15 flex items-center justify-center overflow-hidden shrink-0">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xs font-heading font-bold opacity-70">
                {businessName.slice(0, 1).toUpperCase()}
              </span>
            )}
          </div>
          <span
            className="text-xs font-mono uppercase tracking-wide truncate"
            style={{ color: labelColor }}
          >
            {businessName || "Your Business"}
          </span>
        </div>

        <div
          className={cn("flex flex-wrap gap-2", heroStyle && "rounded-xl p-3 -m-1")}
          style={heroStyle}
        >
          {stamps.map((_, i) =>
            StampIcon ? (
              <StampIcon
                key={i}
                size={22}
                strokeWidth={2}
                style={{
                  color: foregroundColor,
                  opacity: i < currentStamps ? 1 : 0.35,
                }}
              />
            ) : (
              <span
                key={i}
                className="h-6 w-6 rounded-full border-2"
                style={{
                  borderColor: foregroundColor,
                  backgroundColor: i < currentStamps ? foregroundColor : "transparent",
                  opacity: i < currentStamps ? 1 : 0.45,
                }}
              />
            ),
          )}
        </div>

        <div>
          <p
            className="text-[10px] font-mono uppercase tracking-wide mb-1"
            style={{ color: labelColor }}
          >
            Reward
          </p>
          <p className="text-sm font-body leading-snug">
            {rewardDescription || "Collect stamps to earn a reward"}
          </p>
        </div>
      </div>

      <div className="h-12 bg-white flex items-center justify-center gap-[3px] px-5">
        {Array.from({ length: 28 }).map((_, i) => (
          <span
            key={i}
            className="bg-navy"
            style={{
              width: 2,
              height: i % 3 === 0 ? 20 : 28,
            }}
          />
        ))}
      </div>
    </div>
  );
}
