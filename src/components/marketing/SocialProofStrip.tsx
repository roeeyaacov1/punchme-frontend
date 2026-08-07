import {
  partnerLogos as defaultLogos,
  socialProofStats as defaultStats,
  type PartnerLogo,
  type SocialProofStat,
} from "../../config/socialProof";
import { useCountUp } from "../../lib/useCountUp";

interface SocialProofStripProps {
  logos?: PartnerLogo[];
  stats?: SocialProofStat[];
}

function StatCounter({ stat }: { stat: SocialProofStat }) {
  const { ref, value } = useCountUp<HTMLDivElement>(stat.value);
  return (
    <div ref={ref} className="flex flex-col items-center gap-1">
      <span className="text-3xl font-mono font-bold text-gold-dark">
        {value.toLocaleString()}
        {stat.suffix}
      </span>
      <span className="text-sm text-lavender font-body">{stat.label}</span>
    </div>
  );
}

/** Renders nothing until real partner logos or usage stats are added to `src/config/socialProof.ts`. */
export function SocialProofStrip({
  logos = defaultLogos,
  stats = defaultStats,
}: SocialProofStripProps) {
  if (logos.length === 0 && stats.length === 0) return null;

  return (
    <section className="bg-navy text-white py-10 overflow-hidden">
      {stats.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-center gap-12 mb-8">
          {stats.map((stat, i) => (
            <StatCounter key={i} stat={stat} />
          ))}
        </div>
      )}
      {logos.length > 0 && (
        <div className="relative w-full">
          <div className="flex w-max animate-marquee rtl:[animation-direction:reverse] gap-16 px-8">
            {[...logos, ...logos].map((logo, i) => (
              <a
                key={i}
                href={logo.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center opacity-70 hover:opacity-100 transition-opacity shrink-0"
              >
                <img src={logo.logoUrl} alt={logo.name} className="h-8 w-auto" />
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
