import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui";
import { useBusiness } from "../../business/useBusiness";
import { canEnrollRealCustomers } from "../../business/gating";
import { listCustomers } from "../../api/loyalty";

const PAGE_SIZE = 20;

export function CustomersPage() {
  const { t } = useTranslation();
  const { business } = useBusiness();
  const canEnroll = canEnrollRealCustomers(business);
  const [page, setPage] = useState(1);

  const { data } = useQuery({
    queryKey: ["customers", business?.id, page],
    queryFn: () => listCustomers(business!.id!, page, PAGE_SIZE),
    enabled: !!business?.id,
    staleTime: 5_000,
  });

  const items = data?.items ?? [];
  const count = data?.count ?? 0;
  const hasNext = page * PAGE_SIZE < count;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-heading">{t("dashboard.customers.title")}</h1>

      {items.length === 0 ? (
        <p className="text-slate font-body">
          {canEnroll ? (
            t("dashboard.customers.emptyPro")
          ) : (
            <Link to="/dashboard/billing" className="underline">
              {t("dashboard.customers.emptyFree")}
            </Link>
          )}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm font-body">
            <thead>
              <tr className="border-b border-navy/10 text-slate">
                <th className="py-2 pe-4 text-start">{t("dashboard.customers.columns.name")}</th>
                <th className="py-2 pe-4 text-start">{t("dashboard.customers.columns.phone")}</th>
                <th className="py-2 pe-4 text-start">{t("dashboard.customers.columns.progress")}</th>
                <th className="py-2 pe-4 text-start">{t("dashboard.customers.columns.card")}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.card_id} className="border-b border-navy/5">
                  <td className="py-2 pe-4">{c.customer_display_name || "—"}</td>
                  <td className="py-2 pe-4" dir="ltr">{c.customer_phone || "—"}</td>
                  <td className="py-2 pe-4">
                    {c.stamp_count} / {c.stamps_required}
                  </td>
                  <td className="py-2 pe-4">{c.template_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
