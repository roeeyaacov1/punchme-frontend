import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { PunchMark } from "../../components/marketing/PunchMark";
import { ctaClasses, focusRing } from "../../components/marketing/primitives";
import {
  Figure,
  GroupLabel,
  Panel,
  Tag,
} from "../../components/dashboard/primitives";
import { useBusiness } from "../../business/useBusiness";
import { canEnrollRealCustomers } from "../../business/gating";
import { listActivity, type ActivityItem } from "../../api/loyalty";
import { cn } from "../../lib/cn";

const PAGE_SIZE = 20;
/** Above this a single event stops being a row of marks and becomes a
 * number — an import or a big correction, not a visit. */
const PUNCHABLE_EVENT = 6;

function dayKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/**
 * The stamp book.
 *
 * Every line is one press of the stamp, so it is drawn as one — the same
 * mark the overview counts the week in and the wizard counts steps in. The
 * feed is cut into days because that is how an owner remembers a week ("was
 * Tuesday quiet?"), where a flat list of timestamps has to be read twice.
 *
 * `business_user_email` was already coming back from the API and being
 * thrown away. A shop with someone else behind the counter cares who gave
 * the stamp, so it is on the row now.
 */
export function ActivityPage() {
  const { t, i18n } = useTranslation();
  const { business } = useBusiness();
  const canEnroll = canEnrollRealCustomers(business);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["activity", business?.id, page],
    queryFn: () => listActivity(business!.id!, page, PAGE_SIZE),
    enabled: !!business?.id,
    staleTime: 5_000,
  });

  // Memoised because the day grouping below depends on it, and `?? []`
  // would hand that a new array on every render.
  const items = useMemo(() => data?.items ?? [], [data]);
  const count = data?.count ?? 0;
  const hasNext = page * PAGE_SIZE < count;

  const lang = i18n.resolvedLanguage;

  const days = useMemo(() => {
    const today = dayKey(new Date().toISOString());
    const yesterday = dayKey(
      new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    );
    const groups: { key: string; label: string; rows: ActivityItem[] }[] = [];
    for (const event of items) {
      const key = dayKey(event.created_at);
      let group = groups.find((g) => g.key === key);
      if (!group) {
        const label =
          key === today
            ? t("dashboard.activity.today")
            : key === yesterday
              ? t("dashboard.activity.yesterday")
              : new Date(event.created_at).toLocaleDateString(lang, {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                });
        group = { key, label, rows: [] };
        groups.push(group);
      }
      group.rows.push(event);
    }
    return groups;
  }, [items, t, lang]);

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      <h1 className="t-h3 text-ink">{t("dashboard.activity.title")}</h1>

      {isLoading ? (
        <p className="font-mono text-sm text-ink-subtle">{t("common.loading")}</p>
      ) : items.length === 0 ? (
        <Panel className="p-5 sm:p-6">
          {canEnroll ? (
            <p className="text-ink-muted">{t("dashboard.activity.emptyPro")}</p>
          ) : (
            <Link
              to="/dashboard/billing"
              className={cn(
                "inline-flex min-h-[44px] items-center font-semibold text-primary-text underline hover:no-underline",
                focusRing,
              )}
            >
              {t("dashboard.activity.emptyFree")}
            </Link>
          )}
        </Panel>
      ) : (
        <div className="flex flex-col gap-5">
          {days.map((day) => (
            <section key={day.key} className="flex flex-col gap-2">
              <GroupLabel>{day.label}</GroupLabel>
              <Panel className="divide-y divide-border px-4 sm:px-5">
                {day.rows.map((event, i) => {
                  const removed = event.stamps < 0;
                  const size = Math.abs(event.stamps);
                  return (
                    <div
                      key={`${event.card_serial}-${event.created_at}-${i}`}
                      className="flex flex-wrap items-center gap-x-3 gap-y-1.5 py-3"
                    >
                      {removed || size > PUNCHABLE_EVENT ? (
                        <Tag tone={removed ? "warn" : "neutral"}>
                          {removed
                            ? t("dashboard.activity.removed", { count: size })
                            : `+${size}`}
                        </Tag>
                      ) : (
                        <span className="flex items-center gap-1" aria-hidden>
                          {Array.from({ length: size }).map((_, n) => (
                            <PunchMark key={n} state="stamped" size={15} />
                          ))}
                        </span>
                      )}

                      <span className="min-w-0 flex-1 truncate text-sm text-ink-muted">
                        <span className="sr-only">
                          {t("dashboard.activity.cardSerial")}:{" "}
                        </span>
                        <Figure dir="ltr" className="text-ink-subtle">
                          {event.card_serial}
                        </Figure>
                        {event.source === "automation" ? (
                          <Tag tone="accent" className="ms-2 align-middle">
                            {t("messaging.activity.gift")}
                          </Tag>
                        ) : (
                          event.business_user_email && (
                            <span className="ms-2">
                              {t("dashboard.activity.by", {
                                who: event.business_user_email,
                              })}
                            </span>
                          )
                        )}
                      </span>

                      <time
                        dateTime={event.created_at}
                        className="font-mono text-xs tabular-nums text-ink-subtle"
                      >
                        {new Date(event.created_at).toLocaleTimeString(lang, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </time>
                    </div>
                  );
                })}
              </Panel>
            </section>
          ))}
        </div>
      )}

      {count > PAGE_SIZE && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className={ctaClasses("secondary", "sm")}
          >
            {t("common.back")}
          </button>
          <button
            type="button"
            disabled={!hasNext}
            onClick={() => setPage((p) => p + 1)}
            className={ctaClasses("secondary", "sm")}
          >
            {t("common.next")}
          </button>
        </div>
      )}
    </div>
  );
}
