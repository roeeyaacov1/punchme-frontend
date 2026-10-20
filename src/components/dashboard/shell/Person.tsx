import { forwardRef } from "react";
import { useTranslation } from "react-i18next";
import { ChevronRight } from "lucide-react";
import { useAuth } from "../../../auth/useAuth";
import { useBusiness } from "../../../business/useBusiness";
import { focusRingInset } from "../../kit";
import { cn } from "../../../lib/cn";
import { initialOf, personName } from "./personName";

/** The signed-in person's initial in a circle: the account's mark wherever
 * the frame keeps it. Decoration; the name beside it, or the control's
 * label, says who it is. */
export function PersonMark({ className }: { className?: string }) {
  const { user } = useAuth();
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full border border-border-strong bg-background font-heading text-base font-medium leading-none text-ink",
        className,
      )}
    >
      {initialOf(personName(user))}
    </span>
  );
}

/** Who is signed in, as one line: "דנה לוי · בעלים". The name sits in a
 * `<bdi>`, because a Latin name inside Hebrew (or the reverse) must keep its
 * own direction. */
export function PersonLine() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { role } = useBusiness();
  return (
    <>
      <bdi>{personName(user)}</bdi>
      {role && <> · {t(`team.role.${role}`)}</>}
    </>
  );
}

/**
 * The person as a row that opens the account sheet: their initial, their
 * name and their role. 56px, the whole row the one button, with a chevron
 * toward the reading end.
 */
export const PersonRow = forwardRef<
  HTMLButtonElement,
  { onClick: () => void; expanded: boolean; className?: string }
>(function PersonRow({ onClick, expanded, className }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      aria-expanded={expanded}
      className={cn(
        "flex min-h-14 w-full items-center gap-3 rounded-field px-3 py-2 text-start transition-colors duration-gentle ease-out hover-fine:bg-ink/5 [-webkit-tap-highlight-color:transparent]",
        focusRingInset,
        className,
      )}
    >
      <PersonMark />
      <span className="type-body min-w-0 flex-1 truncate font-semibold text-ink">
        <PersonLine />
      </span>
      <ChevronRight aria-hidden className="size-5 shrink-0 text-ink-subtle rtl:-scale-x-100" />
    </button>
  );
});
