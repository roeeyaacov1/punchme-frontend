import { useTranslation } from "react-i18next";
import { Send } from "lucide-react";
import { Button, List, ListRow, Sheet, SkeletonRows } from "../../../components/kit";
import type { AutomationOut, RecipeOut } from "../../../api/messaging";
import { KIND_ICONS } from "./RuleRow";
import { ruleName } from "./rules";

/**
 * The three starters, in the card's language: each its icon, its name and
 * what it does, a link to a new rule seeded from it. Where a rule of that
 * kind already exists it says so, as a note and not a block, because a
 * second win-back at 60 days is a rule an owner may want.
 *
 * With large text on a phone the icon and the chevron left the words 22px:
 * where the longest word can't stand beside them, the chevron goes under, at
 * the end, and then the words under the icon. A name wraps rather than end
 * in an ellipsis, so its words count too.
 */
export function RecipeList({
  recipes,
  rules,
  loading,
  failed,
  onRetry,
}: {
  recipes: readonly RecipeOut[] | undefined;
  rules: readonly AutomationOut[];
  loading: boolean;
  failed: boolean;
  onRetry: () => void;
}) {
  const { t } = useTranslation();
  if (loading) return <SkeletonRows rows={3} />;
  if (failed || !recipes) {
    return (
      <div className="flex flex-col items-start gap-3 px-4 py-3">
        <p className="type-body text-ink">{t("messaging.loadFailed.recipes")}</p>
        <Button variant="secondary" onClick={onRetry} className="max-w-full !whitespace-normal text-center">
          {t("common.retry")}
        </Button>
      </div>
    );
  }
  return (
    <List>
      {recipes
        .filter((recipe) => recipe.kind !== "broadcast")
        .map((recipe) => {
          const Icon = KIND_ICONS[recipe.kind as keyof typeof KIND_ICONS] ?? Send;
          const days = recipe.inactive_days ?? recipe.reward_waiting_days ?? 0;
          const existing = rules.find((rule) => rule.kind === recipe.kind);
          return (
            <ListRow
              key={recipe.key}
              to={`/dashboard/messages/automations/new?recipe=${recipe.key}`}
              chevron
              className="[&>a>span:nth-child(2)]:min-w-min [&>a>svg:last-child]:ms-auto [&>a]:flex-wrap"
              leading={
                <span
                  aria-hidden
                  className="flex size-10 items-center justify-center rounded-full bg-background text-ink-muted [&_svg]:size-5"
                >
                  <Icon />
                </span>
              }
              title={
                <span dir="auto" className="whitespace-normal">
                  {recipe.name}
                </span>
              }
              meta={
                <span className="flex flex-col gap-0.5 whitespace-normal">
                  <span dir="auto" className="[text-align:-webkit-match-parent] [text-align:match-parent]">
                    {recipe.summary.replace("{days}", String(days))}
                  </span>
                  {existing && (
                    <span className="text-ink">
                      {t("messaging.rules.exists", { name: ruleName(existing, t) })}
                    </span>
                  )}
                </span>
              }
            />
          );
        })}
    </List>
  );
}

/** "Which rule?": the starters in a sheet, from "New rule" under the list. */
export function RecipeSheet({
  open,
  onClose,
  ...list
}: {
  open: boolean;
  onClose: () => void;
} & Parameters<typeof RecipeList>[0]) {
  const { t } = useTranslation();
  return (
    <Sheet open={open} onClose={onClose} title={t("messaging.rules.picker")}>
      <div className="-mx-6">
        <RecipeList {...list} />
      </div>
    </Sheet>
  );
}
