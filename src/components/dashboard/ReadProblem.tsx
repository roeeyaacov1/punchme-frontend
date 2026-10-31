import type { HTMLAttributes } from "react";
import { useTranslation } from "react-i18next";
import { WifiOff } from "lucide-react";
import { Button } from "../kit/Button";
import { Notice } from "../kit/Notice";
import { problemKey } from "../../routes/dashboard/problem";

/**
 * A read that didn't land, said where its figures or rows would have stood.
 *
 * Two different things. A read that failed says what it was, why in the
 * page's language, and offers to try again. A read the browser is holding
 * because the device went offline hasn't failed: TanStack Query waits for
 * the connection and sends it then, so there is nothing to press, only
 * that it will load when the connection is back.
 */
export function ReadProblem({
  title,
  error,
  paused,
  onRetry,
  ...props
}: {
  /** What didn't load: "The figures didn't load". */
  title: string;
  error?: unknown;
  /** Held until the device is online again. */
  paused?: boolean;
  onRetry: () => void;
} & Omit<HTMLAttributes<HTMLDivElement>, "title">) {
  const { t } = useTranslation();
  if (paused) {
    return (
      <Notice tone="warn" icon={<WifiOff aria-hidden />} title={t("dashboard.problem.pausedTitle")} {...props}>
        {t("dashboard.problem.paused")}
      </Notice>
    );
  }
  return (
    <Notice
      tone="danger"
      title={title}
      action={
        // Its words wrap with large text rather than widen the page.
        <Button variant="secondary" onClick={onRetry} className="max-w-full !whitespace-normal text-center">
          {t("common.retry")}
        </Button>
      }
      {...props}
    >
      {t(problemKey(error))}
    </Notice>
  );
}
