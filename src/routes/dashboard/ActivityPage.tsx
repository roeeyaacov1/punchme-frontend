import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui";
import { useBusiness } from "../../business/useBusiness";
import { canEnrollRealCustomers } from "../../business/gating";
import { listActivity } from "../../api/loyalty";

const PAGE_SIZE = 20;

export function ActivityPage() {
  const { t } = useTranslation();
  const { business } = useBusiness();
  const canEnroll = canEnrollRealCustomers(business);
  const [page, setPage] = useState(1);

  const { data } = useQuery({
    queryKey: ["activity", business?.id, page],
    queryFn: () => listActivity(business!.id!, page, PAGE_SIZE),
    enabled: !!business?.id,
    staleTime: 5_000,
  });

  const items = data?.items ?? [];
  const count = data?.count ?? 0;
  const hasNext = page * PAGE_SIZE < count;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-heading">{t("dashboard.activity.title")}</h1>

      {items.length === 0 ? (
        <p className="text-slate font-body">
          {canEnroll ? (
            t("dashboard.activity.emptyPro")
          ) : (
            <Link to="/dashboard/billing" className="underline">
              {t("dashboard.activity.emptyFree")}
            </Link>
          )}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((event, i) => (
            <li
              key={`${event.card_serial}-${event.created_at}-${i}`}
              className="flex items-center justify-between border-b border-navy/5 py-2 text-sm font-body"
            >
              <span dir="ltr" className="font-mono text-slate">{event.card_serial}</span>
              <span>+{event.stamps}</span>
              <span className="text-slate">
                {new Date(event.created_at).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}

      {count > PAGE_SIZE && (
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            {t("common.back")}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={!hasNext}
            onClick={() => setPage((p) => p + 1)}
          >
            {t("common.next")}
          </Button>
        </div>
      )}
    </div>
  );
}
