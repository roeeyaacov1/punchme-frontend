import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listTemplates } from "../../../api/businesses";
import { isOwner } from "../../../business/gating";
import { useBusiness } from "../../../business/useBusiness";
import { linkText } from "../../kit";
import { cn } from "../../../lib/cn";
import { ShopSign, type SignState } from "./ShopSign";

/**
 * The shop, as the frame names it: its sign, its name and, on Free, that it
 * isn't live yet. Pro says nothing about the plan at all; the lit sign is
 * the whole of it.
 *
 * `line` is the masthead's single row, where the name truncates at the end
 * edge before the plan's state gives way. `stack` is the desktop rail's
 * head, where the state sits under the name.
 */
export function Identity({ layout, switchOn }: { layout: "line" | "stack"; switchOn: boolean }) {
  const { business, isPro } = useBusiness();
  // The card's real colours for the sign. Same query and same key as the
  // Overview, the studio and the standee, so it is a cache read on every
  // page but the first.
  const { data: templates, isError } = useQuery({
    queryKey: ["templates", business?.id],
    queryFn: () => listTemplates(business!.id!),
    enabled: !!business?.id,
  });
  const template = templates?.[0];
  const state: SignState = !templates && !isError ? "loading" : isPro ? "lit" : "unlit";
  const name = business?.name ?? "";

  const sign = (
    <ShopSign
      name={name}
      background={template?.background_color}
      foreground={template?.foreground_color}
      state={state}
      switchOn={switchOn}
    />
  );
  // `dir="auto"`, so a Latin name in the Hebrew frame (or the reverse) runs
  // and truncates in its own direction.
  const title = (
    <span dir="auto" className="min-w-0 truncate font-heading text-base font-medium text-ink">
      {name}
    </span>
  );

  if (layout === "line") {
    return (
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {sign}
        {title}
        <PlanState />
      </div>
    );
  }
  return (
    <div className="flex min-w-0 items-center gap-3">
      {sign}
      <span className="flex min-w-0 flex-1 flex-col">
        {title}
        <PlanState />
      </span>
    </div>
  );
}

/**
 * "Not live yet", and for the owner the way to change that: "Activate", an
 * ink, underlined link to Billing with a 44px target. A hire is told the
 * same and offered nothing, since Billing would refuse them.
 */
function PlanState() {
  const { t } = useTranslation();
  const { isPro, role } = useBusiness();
  if (isPro) return null;
  return (
    <span className="type-label flex shrink-0 items-center gap-1.5 whitespace-nowrap text-ink-muted">
      {t("dashboard.plan.notLive")}
      {isOwner(role) && (
        <>
          <span aria-hidden>·</span>
          <Link to="/dashboard/billing" className={cn(linkText, "inline-flex min-h-11 items-center")}>
            {t("billing.activateCta")}
          </Link>
        </>
      )}
    </span>
  );
}
