import { useContext, useEffect, useLayoutEffect, useRef, useState, type AnimationEvent, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "../kit";
import { StepArrival } from "./stepArrival";
import { useWide } from "./useWide";

/**
 * One screen of the wizard: its heading, the card, what it asks, and its one
 * coral action.
 *
 * On a phone, and up to 1023px, it is one column. The card stands under the
 * heading, or above it on a screen that leads with the card (`cardFirst`),
 * and the action is docked at the foot of the screen, above the safe area,
 * on a wall-coloured bar with a hairline over it, where a thumb finds it.
 * From 1024px the card stands in a sticky column of its own at the end, with
 * what goes under it, and the action at the foot of the step's column.
 *
 * Each screen brings its own pieces, so a screen that holds its form in a
 * panel of its own (saving the card, going live) passes no heading or action
 * and keeps its buttons where its words are.
 *
 * A screen reached by moving along the road arrives from the side it comes
 * from (`StepArrival`): everything but the docked action, which stays put.
 */
export function StepShell({
  heading,
  card,
  cardFirst = false,
  under,
  notice,
  action,
  children,
}: {
  /** The screen's `StepHeading`. */
  heading?: ReactNode;
  /** The card on its stage. */
  card?: ReactNode;
  /** On a phone, the card before the heading. */
  cardFirst?: boolean;
  /** Under the card, in both layouts: the sample, the reward. */
  under?: ReactNode;
  /** Above the card: what the screen has to say first. */
  notice?: ReactNode;
  /** The screen's one coral action. */
  action?: ReactNode;
  children?: ReactNode;
}) {
  const wide = useWide();
  const { motion, arrived } = useContext(StepArrival);
  const onAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) arrived();
  };

  if (wide) {
    return (
      <div
        className={cn("grid grid-cols-[minmax(0,1fr)_22rem] items-start gap-12 xl:gap-16", motion)}
        onAnimationEnd={onAnimationEnd}
      >
        <div className="flex min-w-0 flex-col gap-6">
          {heading}
          {children}
          {action}
        </div>
        <aside className="sticky top-6 flex flex-col gap-4">
          {notice}
          {card}
          {under}
        </aside>
      </div>
    );
  }

  return (
    <>
      <div className={cn("flex flex-col gap-5", motion)} onAnimationEnd={onAnimationEnd}>
        {cardFirst ? (
          <>
            {notice}
            {card}
            {under}
            {heading}
          </>
        ) : (
          <>
            {heading}
            {notice}
            {card}
            {under}
          </>
        )}
        {children}
      </div>
      {action && <DockedAction>{action}</DockedAction>}
    </>
  );
}

/**
 * The question, taking focus as the screen appears, so a keyboard or a
 * screen reader starts there rather than wherever the last press was;
 * unless the screen opens on something that takes focus itself (`autoFocus`
 * false), such as a tray the map opens by itself. A way back, where there is
 * one, is a 44px button at its start; a line under it says only what the
 * screen can't say by itself.
 */
export function StepHeading({
  title,
  lead,
  onBack,
  autoFocus = true,
}: {
  title: ReactNode;
  lead?: ReactNode;
  onBack?: () => void;
  autoFocus?: boolean;
}) {
  const { t } = useTranslation();
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (autoFocus) heading.current?.focus({ preventScroll: true });
    // As the screen first stands.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-start gap-x-1">
        {onBack && (
          <Button
            variant="quiet"
            size="icon"
            aria-label={t("common.back")}
            title={t("common.back")}
            icon={<ArrowLeft aria-hidden className="rtl:-scale-x-100" />}
            onClick={onBack}
            className="-ms-3 -mt-1 shrink-0"
          />
        )}
        {/* Beside Back while nine of its own characters fit there; under it
            once large text leaves less room than that, so a long word
            (הכרטיסייה) isn't cut in two. On a narrow phone with large text
            the title stops growing at 12vw, which 100% text never reaches;
            a word wider than even that breaks rather than widen the page. */}
        <h1
          ref={heading}
          tabIndex={-1}
          className="type-title min-w-0 flex-1 basis-[9ch] text-balance break-words text-[length:min(1.75rem,12vw)] outline-none"
        >
          {title}
        </h1>
      </div>
      {lead && <p className="type-body text-pretty text-ink-muted">{lead}</p>}
    </div>
  );
}

/**
 * The action at the foot of a phone, and as much room under the page as the
 * bar is tall, so the page's own foot scrolls clear of it at any text size.
 */
function DockedAction({ children }: { children: ReactNode }) {
  const bar = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  useLayoutEffect(() => {
    const element = bar.current;
    if (!element) return;
    const report = () => setHeight(element.offsetHeight);
    report();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(report);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return (
    <>
      {/* The column's own gap, now that the bar stands outside it. */}
      <div aria-hidden className="mt-5" style={{ height }} />
      <div
        ref={bar}
        className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3"
      >
        <div className="mx-auto max-w-lg">{children}</div>
      </div>
    </>
  );
}
