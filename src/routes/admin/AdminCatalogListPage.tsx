import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge, Button, buttonClasses } from "../../components/ui";
import {
  deleteCatalogEntry,
  listCatalog,
  patchCatalogEntry,
  reorderCatalog,
  type CatalogTemplate,
} from "../../api/catalog";

/** Staff catalog manager: ordering, publish toggles, edit/delete. Entries
 * are COPIED on instantiation, so edits and deletes here never touch any
 * business's live card. */
export function AdminCatalogListPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: entries, isLoading } = useQuery({
    queryKey: ["admin-catalog"],
    queryFn: listCatalog,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-catalog"] });

  const togglePublish = useMutation({
    mutationFn: (entry: CatalogTemplate) =>
      patchCatalogEntry(entry.id!, { is_published: !entry.is_published }),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (entry: CatalogTemplate) => deleteCatalogEntry(entry.id!),
    onSuccess: invalidate,
  });

  const move = useMutation({
    mutationFn: ({ index, delta }: { index: number; delta: number }) => {
      const ids = (entries ?? []).map((e) => e.id!);
      const target = index + delta;
      [ids[index], ids[target]] = [ids[target], ids[index]];
      return reorderCatalog(ids);
    },
    onSuccess: invalidate,
  });

  if (isLoading) {
    return <p className="text-slate font-mono text-sm">{t("common.loading")}</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-heading text-navy">{t("admin.catalog.title")}</h1>
        <Link to="/admin/catalog/new" className={buttonClasses("primary", "md")}>
          {t("admin.catalog.create")}
        </Link>
      </div>
      <p className="text-sm text-slate font-body max-w-2xl">{t("admin.catalog.subtitle")}</p>

      <div className="flex flex-col gap-3">
        {(entries ?? []).map((entry, index) => (
          <div
            key={entry.id}
            className="flex flex-wrap items-center gap-3 rounded-xl border border-slate/20 px-4 py-3"
          >
            <span
              className="h-8 w-8 rounded-full shrink-0 border border-slate/20"
              style={{ backgroundColor: entry.background_color ?? "#FFFFFF" }}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-navy truncate">
                {entry.name}
                <span className="text-slate font-mono text-xs ms-2">{entry.id}</span>
              </p>
              <p className="text-xs text-slate truncate">
                {t(`onboarding.business.niches.${entry.niche}`, entry.niche ?? "")}
                {entry.description ? ` · ${entry.description}` : ""}
              </p>
            </div>
            <Badge tone={entry.is_published ? "gold" : "neutral"}>
              {entry.is_published ? t("admin.catalog.published") : t("admin.catalog.draft")}
            </Badge>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={index === 0 || move.isPending}
                onClick={() => move.mutate({ index, delta: -1 })}
                className="px-2 py-1 text-slate hover:text-navy disabled:opacity-30"
                aria-label={t("admin.catalog.moveUp")}
              >
                ↑
              </button>
              <button
                type="button"
                disabled={index === (entries?.length ?? 0) - 1 || move.isPending}
                onClick={() => move.mutate({ index, delta: 1 })}
                className="px-2 py-1 text-slate hover:text-navy disabled:opacity-30"
                aria-label={t("admin.catalog.moveDown")}
              >
                ↓
              </button>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => togglePublish.mutate(entry)}
              disabled={togglePublish.isPending}
            >
              {entry.is_published ? t("admin.catalog.unpublish") : t("admin.catalog.publish")}
            </Button>
            <Link to={`/admin/catalog/${entry.id}`} className={buttonClasses("secondary", "sm")}>
              {t("common.edit")}
            </Link>
            <button
              type="button"
              onClick={() => {
                if (window.confirm(t("admin.catalog.deleteConfirm", { name: entry.name }))) {
                  remove.mutate(entry);
                }
              }}
              className="text-xs text-red-600 underline hover:no-underline"
            >
              {t("common.remove")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
