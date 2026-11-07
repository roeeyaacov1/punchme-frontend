import { useMemo, useRef, type CSSProperties, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { Preset } from "../../../src/api/presets";
import { AppleCardPreview, GoogleCardPreview } from "../../../src/components/card-studio/CardPreviews";
import type { Lang } from "../i18n";
import { lookPass } from "../looks";
import { Scaled } from "../pieces";
import { useImagesReady } from "./useImagesReady";

/** The Apple pass's own height at 300px with a drawn strip, for placing it. */
export const PASS_H = 352;

/**
 * A look as the real pass, `AppleCardPreview` or `GoogleCardPreview` in its
 * 300px slot, scaled up evenly as a whole. Its pictures are the wallet's
 * drawings; the frame waits for them (`useImagesReady`).
 */
export function LookCard({
  preset,
  stamps,
  platform = "apple",
  scale,
  overlay,
  className,
  style,
}: {
  preset: Preset;
  stamps: number | "own";
  platform?: "apple" | "google";
  scale: number;
  overlay?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as Lang;
  const ref = useRef<HTMLDivElement>(null);
  useImagesReady(ref);
  const value = useMemo(() => lookPass(preset, stamps, t, lang), [preset, stamps, t, lang]);
  const Preview = platform === "apple" ? AppleCardPreview : GoogleCardPreview;
  return (
    <div ref={ref} className={className} style={style}>
      <Scaled width={300} scale={scale} overlay={overlay}>
        <div className="font-normal not-italic leading-normal tracking-normal">
          <Preview {...value} />
        </div>
      </Scaled>
    </div>
  );
}
