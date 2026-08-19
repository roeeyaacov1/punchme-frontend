import { useTranslation } from "react-i18next";
import { CardChip } from "../dashboard/CardChip";
import { LitStage } from "../dashboard/primitives";
import { cn } from "../../lib/cn";

/**
 * The message as a lock-screen banner, drawn live while the owner types.
 *
 * Its own markup rather than the landing page's NotificationBanner: that one
 * is a fixed marketing prop with no title slot; this one has to take the
 * card's real colours as the app icon, the business as the sender, and the
 * title/body the owner is editing — and to stay honest it is labelled
 * "roughly", because iOS and Android each draw it a little differently.
 */
export function NotificationPreview({
  appName,
  title,
  body,
  backgroundColor,
  foregroundColor,
  className,
}: {
  appName: string;
  title: string;
  body: string;
  backgroundColor?: string | null;
  foregroundColor?: string | null;
  className?: string;
}) {
  const { t } = useTranslation();
  return (
    <LitStage className={cn("p-3 sm:p-4", className)} innerClassName="flex flex-col gap-2">
      <p className="t-eyebrow text-ink-subtle">{t("messaging.editor.previewLabel")}</p>
      <div className="rounded-2xl bg-white p-3 shadow-[0_12px_32px_-12px_rgb(15_15_35/0.45)]">
        <div className="flex items-center gap-3">
          <CardChip
            name={appName}
            backgroundColor={backgroundColor}
            foregroundColor={foregroundColor}
            size={28}
          />
          <p className="t-eyebrow min-w-0 flex-1 truncate text-ink" dir="auto">
            {appName}
          </p>
          <span className="shrink-0 text-xs text-ink-subtle">
            {t("messaging.editor.previewNow")}
          </span>
        </div>
        {title && (
          <p className="mt-2 text-sm font-semibold text-ink" dir="auto">
            {title}
          </p>
        )}
        <p
          className={cn(
            "text-pretty text-sm leading-relaxed text-ink-muted",
            title ? "mt-0.5" : "mt-2",
          )}
          dir="auto"
        >
          {body || " "}
        </p>
      </div>
    </LitStage>
  );
}
