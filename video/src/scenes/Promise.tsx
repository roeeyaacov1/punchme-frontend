import { useTranslation } from "react-i18next";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { SLAMS } from "../cues.ts";
import { OVERSHOOT, lerp, progress } from "../motion.ts";
import { useHebrew } from "../pieces";
import { Slam } from "../stage/Slam";

const KEYS = ["app", "account", "password"] as const;

/** A small hole punched beside a promise as it lands: ink, with the shadow a cut throws. */
function Hole({ at }: { at: number }) {
  const t = useCurrentFrame();
  const p = progress(t, at, 6, OVERSHOOT);
  return (
    <span
      className="inline-block shrink-0 rounded-full bg-ink"
      style={{
        width: 84,
        height: 84,
        opacity: t >= at ? 1 : 0,
        transform: `scale(${lerp(1.8, 1, p)})`,
        boxShadow: "inset 0 10px 14px rgb(0 0 0 / 0.55)",
      }}
    />
  );
}

/**
 * Beat 2, on coral (ink on it, 5.50:1): the three things it never asks
 * for, each slammed in with a hole punched beside it, like ticking them off.
 */
export function PromiseScene() {
  const { t } = useTranslation();
  const at = SLAMS.promise!;
  const hebrew = useHebrew();
  return (
    <AbsoluteFill className="justify-center" style={{ paddingInline: 96, paddingTop: 120 }}>
      <div className="flex flex-col items-start gap-[56px]">
        {KEYS.map((key, i) => (
          <div key={key} className="flex items-center gap-[40px]">
            <Hole at={at[i]} />
            <Slam at={at[i]} size={112} className="whitespace-nowrap text-start" style={{ transformOrigin: hebrew ? "100% 50%" : "0% 50%" }}>
              {t(`video:promise.${key}`)}
            </Slam>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
}
