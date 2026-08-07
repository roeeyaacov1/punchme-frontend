export interface PartnerLogo {
  name: string;
  logoUrl: string;
  href?: string;
}

export interface SocialProofStat {
  value: number;
  suffix?: string;
  label: string;
}

/**
 * Empty until we have real partners/usage numbers to show — SocialProofStrip
 * renders nothing when both arrays are empty, so this is safe to ship as-is.
 * Fill these in once we have real data; no component changes needed.
 */
export const partnerLogos: PartnerLogo[] = [];
export const socialProofStats: SocialProofStat[] = [];
