import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { PunchMark } from "../marketing/PunchMark";
import { ctaClasses, focusRing } from "../marketing/primitives";
import { GroupLabel } from "../dashboard/primitives";
import { useBusiness } from "../../business/useBusiness";
import { canEnrollRealCustomers } from "../../business/gating";
import { isStandalone } from "../../pwa/installPrompt";
import { usePrefersReducedMotion } from "../../lib/usePrefersReducedMotion";
import { cn } from "../../lib/cn";
import { tourSteps, type TourStep } from "./steps";
import { hasSeenTour, markTourSeen, type TourContext } from "./seen";

/**
 * The dashboard, walked.
 *
 * It drives the router to each stop, finds the one element that stop is
 * about, and cuts the rest of the page dark around it. There is no drawing of
 * the product anywhere in here: what is lit is the owner's own overview,
 * their own roster, their own standee. A tour made of pictures goes stale the
 * first time a page changes; this one cannot.
 *
 * **The hole is a real hole.** The dark is four rectangles laid around the
 * target, not one sheet with a cut-out — which means the lit element has
 * nothing over it at all and stays live: scrollable, clickable, tabbable.
 * That is the difference between showing somebody the scanner and letting
 * them open it, and it is why the last stop can simply say "tap it".
 *
 * Two moments earn it: the redirect out of the wizard, and the first launch
 * from the home-screen icon. `seen.ts` remembers those separately.
 *
 * It only ever *starts* on the overview. The installed app carries a "Scan a
 * card" shortcut, and a tour that opens over the scanner is a tour that opens
 * with a customer waiting.
 */

/** Breathing room between the lit element and the dark. */
const HALO = 8;
/** Between the lit element and the card that explains it. */
const GAP = 12;
/** Keeps the card off the screen edges. */
const MARGIN = 16;
const CARD_MAX = 380;
/** Where the top of a thing too long to hold in one screen is parked, as a
 * share of the screen. Enough dark above it to read as a frame. */
const LIT_TOP = 0.08;
/** How long to wait for a stop's element before giving up and just talking.
 * A cold customers page has a request to finish first. */
const ANCHOR_MS = 5_000;

interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

/** The first element carrying this anchor that is actually on screen. The
 * rail and the tab bar both answer to `nav-scan`, and the roster is a table
 * on a desk and a stack of cards on a phone — in each pair one of the two is
 * `display: none` and measures zero. */
function findAnchor(anchor: string): HTMLElement | null {
  const all = Array.from(
    document.querySelectorAll<HTMLElement>(`[data-tour="${anchor}"]`),
  );
  for (const el of all) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return el;
  }
  return null;
}

export function DashboardTour({ replay = 0 }: { replay?: number }) {
  const { business, role } = useBusiness();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Read once. A page cannot stop being standalone while it is running, and
  // pinning it means the context that opened the tour is the context that
  // gets marked when it closes.
  const context = useRef<TourContext>(isStandalone() ? "app" : "web");
  const decided = useRef(false);

  const steps = useMemo(
    () => tourSteps(role, canEnrollRealCustomers(business)),
    [role, business],
  );

  useEffect(() => {
    if (decided.current) return;
    // `business` carries both the role and the plan the walk is built from,
    // so an early run would build the wrong one.
    if (!business) return;
    if (location.pathname !== "/dashboard") return;
    decided.current = true;
    if (steps.length === 0) return;
    if (hasSeenTour(context.current)) return;
    setOpen(true);
  }, [business, location.pathname, steps.length]);

  // Asked for from the account menu. The count only ever goes up; its
  // starting value is whatever it was when this mounted, so the first render
  // is not itself a request.
  const asked = useRef(replay);
  useEffect(() => {
    if (replay === asked.current) return;
    asked.current = replay;
    decided.current = true;
    setOpen(true);
  }, [replay]);

  const close = useCallback(() => {
    setOpen(false);
    markTourSeen(context.current);
  }, []);

  if (!open || steps.length === 0) return null;
  // Keyed so a replay starts at the first stop rather than wherever the last
  // run stopped.
  return <Walk key={replay} steps={steps} onClose={close} />;
}

function Walk({ steps, onClose }: { steps: TourStep[]; onClose: () => void }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const reduced = usePrefersReducedMotion();
  const rtl = i18n.dir() === "rtl";

  const [index, setIndex] = useState(0);
  const [target, setTarget] = useState<HTMLElement | null>(null);
  /** The element's box on screen, or null while the tour is only talking. */
  const [box, setBox] = useState<Box | null>(null);
  const [place, setPlace] = useState<{ top: number; left: number } | null>(null);

  const card = useRef<HTMLDivElement>(null);
  const [view, setView] = useState(() => ({
    w: typeof window === "undefined" ? 0 : window.innerWidth,
    h: typeof window === "undefined" ? 0 : window.innerHeight,
  }));
  const step = steps[index];
  const last = index === steps.length - 1;

  const finish = useCallback(() => {
    // Back where the walk began. It moved them through five pages to get
    // here; leaving them on the last one would be leaving them lost.
    if (location.pathname !== "/dashboard") navigate("/dashboard", { replace: true });
    onClose();
  }, [location.pathname, navigate, onClose]);

  const go = useCallback(
    (move: number) =>
      setIndex((i) => Math.min(steps.length - 1, Math.max(0, i + move))),
    [steps.length],
  );

  // ---- driving ------------------------------------------------------------
  // On the step, not on the location: if the owner follows a link out of the
  // lit element, the tour should lose its anchor and keep talking, not drag
  // them back to where it wanted them.
  //
  // `replace`, so a five-stop walk does not leave five entries in the history
  // for the back button to climb.
  useEffect(() => {
    setTarget(null);
    setBox(null);
    setPlace(null);
    if (window.location.pathname !== step.to) {
      navigate(step.to, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  // ---- finding the thing --------------------------------------------------
  useEffect(() => {
    let stop = false;
    const started = performance.now();
    const look = () => {
      if (stop) return;
      const el = findAnchor(step.anchor);
      if (el) {
        setTarget(el);
        return;
      }
      // Gave up: the page is one this business does not have (an empty
      // roster, a panel behind a plan), or the request is still out. Say the
      // sentence anyway rather than hanging on a dark screen.
      if (performance.now() - started > ANCHOR_MS) return;
      requestAnimationFrame(look);
    };
    look();
    return () => {
      stop = true;
    };
  }, [step.anchor, location.pathname]);

  // ---- measuring ----------------------------------------------------------
  useEffect(() => {
    if (!target) return;

    // Instantly, not smoothly: a smooth scroll is still travelling when the
    // first measurement lands, and the hole ends up cut around where the
    // element used to be.
    // Its own function: every branch below ends the *scrolling*, not the
    // effect, which still has a measurement and three listeners to set up.
    const settle = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const litHeight = target.getBoundingClientRect().height + HALO * 2;
      // The card is already laid out — invisible until it is placed, but
      // measurable — so the scroll can be chosen knowing what has to fit.
      const cardH = card.current?.offsetHeight ?? 220;
      const cardW = Math.min(CARD_MAX, vw - MARGIN * 2);

      if (litHeight > vh - MARGIN * 2) {
        // Longer than the screen. Park its top rather than centring it, so
        // what shows is the beginning of the thing — the first rows of a
        // roster, not its middle — with dark above it to frame it.
        target.scrollIntoView({ block: "start", inline: "center" });
        window.scrollBy(0, -Math.round(vh * LIT_TOP));
        return;
      }

      target.scrollIntoView({ block: "center", inline: "center" });

      // Centred is only right if the card can stand clear of it. Where a
      // flank is wide enough the card goes beside it and centred is right;
      // where neither is — a phone, mostly — lift the thing until there is
      // room underneath. A card sitting on top of what it points at is the
      // one thing a spotlight must not do.
      const rect = target.getBoundingClientRect();
      const beside =
        Math.max(
          vw - (rect.right + HALO) - GAP - MARGIN,
          rect.left - HALO - GAP - MARGIN,
        ) >= cardW;
      if (beside) return;

      const room = vh - litHeight - GAP - cardH - MARGIN;
      const top = rect.top - HALO;
      if (room >= MARGIN && top > room) window.scrollBy(0, top - room);
    };
    settle();

    let frame = 0;
    const measure = () => {
      frame = 0;
      const r = target.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) {
        setBox(null);
        return;
      }
      // The element, plus a hair of air, and nothing else. Deliberately not
      // clipped to the screen: a roster is longer than any phone, and a rim
      // ruled across the middle of one draws a rectangle the page does not
      // have. Where the thing runs past the fold its edge is simply off
      // screen — which is what "it carries on" looks like.
      setBox({
        top: r.top - HALO,
        left: r.left - HALO,
        width: r.width + HALO * 2,
        height: r.height + HALO * 2,
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("resize", schedule);
    // Capturing: the thing that moved may be inside a scroller of its own —
    // the roster's table scrolls sideways under its panel.
    window.addEventListener("scroll", schedule, true);
    const observer = new ResizeObserver(schedule);
    observer.observe(target);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule, true);
      observer.disconnect();
    };
  }, [target]);

  // ---- placing the card ---------------------------------------------------
  // Before paint, so it never shows up in the wrong place first.
  useLayoutEffect(() => {
    const el = card.current;
    if (!el) return;
    const width = Math.min(CARD_MAX, window.innerWidth - MARGIN * 2);
    const height = el.offsetHeight;
    const vh = window.innerHeight;
    const vw = window.innerWidth;

    if (!box) {
      setPlace({
        top: Math.max(MARGIN, (vh - height) / 2),
        left: Math.max(MARGIN, (vw - width) / 2),
      });
      return;
    }

    const clampX = (x: number) =>
      Math.min(Math.max(MARGIN, x), Math.max(MARGIN, vw - width - MARGIN));
    const clampY = (y: number) =>
      Math.min(Math.max(MARGIN, y), Math.max(MARGIN, vh - height - MARGIN));

    const middleX = clampX(box.left + box.width / 2 - width / 2);
    // The middle of however much of it is on screen — a list running off the
    // bottom must not drag the card off with it.
    const middleY = clampY(
      (Math.max(0, box.top) + Math.min(vh, box.top + box.height)) / 2 -
        height / 2,
    );

    const below = box.top + box.height + GAP;
    const above = box.top - GAP - height;
    const endSide = box.left + box.width + GAP;
    const startSide = box.left - GAP - width;
    // Whichever flank has more room, which is the same question in either
    // writing direction — the geometry is measured, not assumed.
    const roomEnd = vw - endSide - MARGIN;
    const roomStart = box.left - GAP - MARGIN;

    if (below + height + MARGIN <= vh) {
      setPlace({ top: below, left: middleX });
    } else if (above >= MARGIN) {
      setPlace({ top: above, left: middleX });
    } else if (Math.max(roomEnd, roomStart) >= width) {
      setPlace({
        top: middleY,
        left: roomEnd >= roomStart ? endSide : startSide,
      });
    } else {
      // Nothing fits around it. Sit as low as the screen allows, which covers
      // the least of it — the page could not be scrolled far enough to open a
      // gap, so some overlap is the honest outcome rather than a bug.
      setPlace({ top: Math.max(MARGIN, vh - height - MARGIN), left: middleX });
    }
  }, [box, index, view, i18n.resolvedLanguage]);

  // ---- keyboard, focus, and the lock --------------------------------------
  useEffect(() => {
    // Nothing to restore focus to on the way out: the walk moves through five
    // pages, so whatever was focused when it opened is long unmounted.
    card.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        finish();
        return;
      }
      const forward = rtl ? "ArrowLeft" : "ArrowRight";
      const backward = rtl ? "ArrowRight" : "ArrowLeft";
      if (event.key === forward || event.key === backward) {
        event.preventDefault();
        go(event.key === forward ? 1 : -1);
        return;
      }
      if (event.key !== "Tab") return;

      // Tab walks the card and the lit element, and nothing else. Including
      // the lit element is the point — a keyboard has to be able to reach the
      // thing the tour is pointing at, or "tap it" is a lie on a laptop.
      const stops: HTMLElement[] = [
        ...(card.current?.querySelectorAll<HTMLElement>("button") ?? []),
      ];
      if (target) {
        const inside =
          target.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
          );
        stops.push(...(inside.length ? inside : [target]));
      }
      if (!stops.length) return;

      const at = stops.indexOf(document.activeElement as HTMLElement);
      event.preventDefault();
      const next =
        at === -1
          ? event.shiftKey
            ? stops.length - 1
            : 0
          : (at + (event.shiftKey ? -1 : 1) + stops.length) % stops.length;
      stops[next].focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [finish, go, rtl, target]);

  // Focus moves to the card on every stop, so a screen reader is handed the
  // new sentence rather than left on a button that has just changed meaning.
  useEffect(() => {
    card.current?.focus();
  }, [index]);

  // ---- the tap that ends it ----------------------------------------------
  useEffect(() => {
    if (!step.act || !target) return;
    const onClick = (event: MouseEvent) => {
      if (!target.contains(event.target as Node)) return;
      // They went where the tour pointed. Their navigation stands; do not
      // haul them back to the overview behind it.
      onClose();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [step.act, target, onClose]);

  // A rotate or a keyboard opening moves everything, including the card,
  // and a stop with no lit element has no other reason to re-render.
  useEffect(() => {
    const onResize = () =>
      setView({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const scrim = "pointer-events-auto fixed bg-navy-deep/70 backdrop-blur-[1px]";
  const { w: vw, h: vh } = view;
  /** The box clipped to the screen — what the dark is laid out against. */
  const clip = (n: number, max: number) => Math.min(Math.max(0, n), max);
  const edge = box
    ? {
        top: clip(box.top, vh),
        bottom: clip(box.top + box.height, vh),
        left: clip(box.left, vw),
        right: clip(box.left + box.width, vw),
      }
    : { top: 0, bottom: 0, left: 0, right: 0 };

  return (
    // Transparent to the pointer, so that only what is drawn inside it — the
    // four dark panes and the card — takes a click. The gap between them is
    // the lit element, and it must feel like nothing is there.
    <div className="pointer-events-none fixed inset-0 z-50">
      {/* Four panes rather than one sheet with a hole punched in it. A hole
          made of shadow still swallows the taps aimed at what it reveals; a
          gap between four rectangles has nothing over it at all. */}
      {box ? (
        <>
          {/* The panes are the box seen through the screen: a thing that runs
              past an edge simply has no dark on that side. The rim below is
              drawn at the box's true bounds instead, so its edges land on the
              element and the ones off screen are not drawn at all. */}
          <div className={scrim} style={{ top: 0, left: 0, width: vw, height: edge.top }} />
          <div
            className={scrim}
            style={{ top: edge.bottom, left: 0, width: vw, height: vh - edge.bottom }}
          />
          <div
            className={scrim}
            style={{
              top: edge.top,
              left: 0,
              width: edge.left,
              height: edge.bottom - edge.top,
            }}
          />
          <div
            className={scrim}
            style={{
              top: edge.top,
              left: edge.right,
              width: vw - edge.right,
              height: edge.bottom - edge.top,
            }}
          />
          {/* The rim, and nothing else — pointer-events-none, or it would be
              the very thing the four panes were arranged to avoid. */}
          <div
            aria-hidden
            className="pointer-events-none fixed rounded-2xl ring-2 ring-primary"
            style={box}
          />
        </>
      ) : (
        <div className={cn(scrim, "inset-0")} style={{ width: vw, height: vh }} />
      )}

      <div
        ref={card}
        role="dialog"
        aria-modal="true"
        aria-label={t("tour.label")}
        tabIndex={-1}
        className={cn(
          "pointer-events-auto fixed flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 shadow-panel-lift outline-none sm:p-5",
          !reduced && "animate-sheet-up",
          !place && "invisible",
        )}
        style={{
          top: place?.top ?? 0,
          left: place?.left ?? 0,
          width: Math.min(CARD_MAX, vw - MARGIN * 2),
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <GroupLabel>{t("tour.title")}</GroupLabel>
          <button
            type="button"
            onClick={finish}
            className={cn(
              "-me-2 inline-flex min-h-[44px] items-center rounded-xl px-3 text-sm font-semibold text-ink-subtle transition-colors hover:text-ink",
              focusRing,
            )}
          >
            {t("tour.skip")}
          </button>
        </div>

        {/* One live region per stop, so moving on is announced as the
            sentence it is rather than as three unrelated changes — position
            first, because how much is left is the thing the marks show and
            speech cannot. */}
        <div aria-live="polite" className="flex flex-col gap-2">
          <p className="sr-only">
            {t("tour.progress", { step: index + 1, total: steps.length })}
          </p>

          <h2 className="t-card-title flex items-center gap-2 text-ink">
            <step.Icon size={18} aria-hidden className="shrink-0 text-primary-text" />
            {t(step.title)}
          </h2>

          {/* Where it lives, in the rail's own words and off the rail's own
              keys — the rail itself is under the dark at this moment. */}
          <GroupLabel>
            {t(`dashboard.groups.${step.group}`)} · {t(`dashboard.nav.${step.nav}`)}
          </GroupLabel>

          <p className="text-sm text-ink-muted">{t(step.body)}</p>

          {step.act && target && (
            <p className="text-sm font-semibold text-primary-text">{t(step.act)}</p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
          {/* The card filling up, which is the one form this product already
              means something by. Decorative — the line above says it in
              words. */}
          <span aria-hidden className="flex items-center gap-1.5">
            {steps.map((s, i) => (
              <PunchMark
                key={s.key}
                state={i <= index ? "stamped" : "empty"}
                size={13}
              />
            ))}
          </span>

          <div className="flex items-center gap-2">
            {index > 0 && (
              <button
                type="button"
                onClick={() => go(-1)}
                className={ctaClasses("secondary", "sm")}
              >
                {t("common.back")}
              </button>
            )}
            <button
              type="button"
              onClick={last ? finish : () => go(1)}
              className={ctaClasses("primary", "sm")}
            >
              {last ? t("tour.done") : t("common.next")}
              {!last && (
                <ArrowRight size={15} aria-hidden className="rtl:-scale-x-100" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
