import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Trans, useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAuth } from "../../auth/useAuth";
import { useBusiness } from "../../business/useBusiness";
import { canEnrollRealCustomers, isOwner } from "../../business/gating";
import { isStandalone } from "../../pwa/installPrompt";
import { Button, StampRow, useReducedMotion } from "../kit";
import { cn } from "../../lib/cn";
import { whenNothingModal } from "../dashboard/shell/whenNothingModal";
import { tourSteps, type TourStep } from "./steps";
import { hasSeenTour, markTourSeen, type TourContext } from "./seen";
import { GAP, MARGIN, cardWidth, placeCard, type Box, type Size } from "./placement";

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
 * from the home-screen icon. `seen.ts` remembers those separately, for each
 * person. It holds back on the day of activation, so "You're live!" and the
 * sign switching on aren't covered; it opens on the next arrival instead.
 *
 * It only ever *starts* on the overview. The installed app carries a "Scan a
 * card" shortcut, and a tour that opens over the scanner is a tour that opens
 * with a customer waiting.
 *
 * It wears the frame's Lightbox: the kit's scrim with no blur, an ink rim
 * around what is lit, and a kit panel with kit buttons, its progress the
 * card filling up.
 */

/** Breathing room between the lit element and the dark. */
const HALO = 8;
/** Where the top of a thing too long to hold in one screen is parked, as a
 * share of the screen. Enough dark above it to read as a frame. */
const LIT_TOP = 0.08;
/** How long to wait for a stop's element before giving up and just talking.
 * A cold customers page has a request to finish first. */
const ANCHOR_MS = 5_000;

/** The first element carrying this anchor that is actually on screen. The
 * bar and the rails all answer to `nav-scan`, and the roster is a table on a
 * desk and a stack of cards on a phone — the ones not showing are
 * `display: none` and measure zero. */
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

/** The screen's safe areas at the top and the bottom, as numbers: the card
 * keeps clear of the notch and the home indicator. */
function safeInsets(): { top: number; bottom: number } {
  const probe = document.createElement("div");
  probe.style.cssText =
    "position:fixed;visibility:hidden;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)";
  document.body.appendChild(probe);
  const style = getComputedStyle(probe);
  const insets = { top: parseFloat(style.paddingTop) || 0, bottom: parseFloat(style.paddingBottom) || 0 };
  probe.remove();
  return insets;
}

export function DashboardTour({
  replay = 0,
  frame,
  onOpenChange,
}: {
  replay?: number;
  /** The frame's theme classes: the tour is part of the frame. */
  frame: string;
  /** Told when the walk opens and closes, so the shell leaves the focus and
   * the announcements of its own navigations to it. */
  onOpenChange?: (open: boolean) => void;
}) {
  const { business, role } = useBusiness();
  const { user } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Read once. A page cannot stop being standalone while it is running, and
  // pinning it means the context that opened the tour is the context that
  // gets marked when it closes.
  const context = useRef<TourContext>(isStandalone() ? "app" : "web");
  const decided = useRef(false);
  /** Where focus was when the walk opened, to give it back on closing. */
  const returnTo = useRef<HTMLElement | null>(null);

  const steps = useMemo(
    () => tourSteps(role, canEnrollRealCustomers(business)),
    [role, business],
  );
  const activated = new URLSearchParams(location.search).get("activated") === "1";

  const begin = useCallback(() => {
    const active = document.activeElement;
    returnTo.current = active instanceof HTMLElement && active !== document.body ? active : null;
    setOpen(true);
  }, []);

  useEffect(() => {
    if (decided.current) return;
    // `business` carries both the role and the plan the walk is built from,
    // and `user` whose walk it is, so an early run would build the wrong one.
    if (!business || !user) return;
    if (location.pathname !== "/dashboard") return;
    // The day of activation: not opened and not marked seen, so it opens on
    // the next arrival instead of over "You're live!".
    if (activated) return;
    decided.current = true;
    if (steps.length === 0) return;
    if (hasSeenTour(user.id, context.current, isOwner(role))) return;
    begin();
  }, [business, user, role, location.pathname, activated, steps.length, begin]);

  // Asked for from the account sheet. The count only ever goes up; its
  // starting value is whatever it was when this mounted, so the first render
  // is not itself a request. The sheet it was asked from is still closing,
  // so the walk waits for it.
  const asked = useRef(replay);
  useEffect(() => {
    if (replay === asked.current) return;
    asked.current = replay;
    decided.current = true;
    let cancelled = false;
    void whenNothingModal().then(() => {
      if (!cancelled) begin();
    });
    return () => {
      cancelled = true;
    };
  }, [replay, begin]);

  useEffect(() => {
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  // `toPage`: the walk ended somewhere other than where it began (it brought
  // them back to the Overview, or the last stop's tap took them to Scan), so
  // focus goes to the page. Otherwise it goes back where it was. Never to
  // <body>.
  const close = useCallback(
    (toPage: boolean) => {
      setOpen(false);
      if (user) markTourSeen(user.id, context.current);
      const back = returnTo.current;
      returnTo.current = null;
      const target = !toPage && back?.isConnected ? back : document.getElementById("dashboard-main");
      target?.focus({ preventScroll: true });
    },
    [user],
  );

  if (!open || steps.length === 0) return null;
  // Keyed so a replay starts at the first stop rather than wherever the last
  // run stopped.
  return (
    <div className={cn(frame, "contents")}>
      <Walk key={replay} steps={steps} onClose={close} />
    </div>
  );
}

function Walk({ steps, onClose }: { steps: TourStep[]; onClose: (toPage: boolean) => void }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const reduced = useReducedMotion();
  const rtl = i18n.dir() === "rtl";

  const [index, setIndex] = useState(0);
  const [target, setTarget] = useState<HTMLElement | null>(null);
  /** The element's box on screen, or null while the tour is only talking. */
  const [box, setBox] = useState<Box | null>(null);
  /** The card's own size, measured after every render that could change it. */
  const [cardSize, setCardSize] = useState<Size | null>(null);

  const card = useRef<HTMLDivElement>(null);
  const [view, setView] = useState(() => ({
    w: typeof window === "undefined" ? 0 : window.innerWidth,
    h: typeof window === "undefined" ? 0 : window.innerHeight,
    ...safeInsets(),
  }));
  const step = steps[index];
  const last = index === steps.length - 1;

  const finish = useCallback(() => {
    // Back where the walk began. It moved them through five pages to get
    // here; leaving them on the last one would be leaving them lost.
    const away = location.pathname !== "/dashboard";
    if (away) navigate("/dashboard", { replace: true });
    onClose(away);
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
      // sentence anyway, centred, rather than hanging on a dark screen.
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
    // element used to be. Said on every call, because the landing page sets
    // `scroll-behavior: smooth` on <html> and a call that names no behaviour
    // inherits it.
    // Its own function: every branch below ends the *scrolling*, not the
    // effect, which still has a measurement and three listeners to set up.
    const settle = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const litHeight = target.getBoundingClientRect().height + HALO * 2;
      // The card is already laid out, so the scroll can be chosen knowing
      // what has to fit.
      const cardH = card.current?.offsetHeight ?? 220;
      const cardW = cardWidth(vw);

      if (litHeight > vh - MARGIN * 2) {
        // Longer than the screen. Park its top rather than centring it, so
        // what shows is the beginning of the thing — the first rows of a
        // roster, not its middle — with dark above it to frame it.
        target.scrollIntoView({ behavior: "instant", block: "start", inline: "center" });
        window.scrollBy({ top: -Math.round(vh * LIT_TOP), behavior: "instant" });
        return;
      }

      target.scrollIntoView({ behavior: "instant", block: "center", inline: "center" });

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
      if (room >= MARGIN && top > room) window.scrollBy({ top: top - room, behavior: "instant" });
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
  // The place itself is worked out while rendering (`placeCard`, below), from
  // the box, the screen and the card's size, so no effect can leave the card
  // without one. Only its size needs the DOM, and it is stored only when it
  // changed.
  const measureCard = useCallback(() => {
    const el = card.current;
    if (!el) return;
    const width = cardWidth(window.innerWidth);
    const height = el.offsetHeight;
    setCardSize((size) =>
      size && size.width === width && size.height === height ? size : { width, height },
    );
  }, []);
  // Before paint, whenever what the card holds could have changed: the stop,
  // the "tap it" line that comes with a found element, the language, the
  // screen. The first of these is the one moment the card has no place yet,
  // and this gives it one before anything is drawn.
  useLayoutEffect(measureCard, [measureCard, index, target, view, i18n.resolvedLanguage]);
  // And whatever else moves its edges, such as a webfont arriving late. An
  // observer reports a frame later, which is why it isn't the only measure.
  useLayoutEffect(() => {
    const el = card.current;
    if (!el) return;
    const observer = new ResizeObserver(measureCard);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measureCard]);

  // ---- keyboard, focus, and the lock --------------------------------------
  useEffect(() => {
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
  // Not before the card has its place: until then it is hidden, and a hidden
  // element can't take focus.
  const shown = cardSize !== null;
  useEffect(() => {
    if (shown) card.current?.focus();
  }, [index, shown]);

  // ---- the tap that ends it ----------------------------------------------
  // The last stop lights Scan. A tap on it ends the walk on every plan, not
  // only where the copy asks for one: a Free owner who taps it anyway mustn't
  // be left with the tour over the scanner. Their navigation stands; the
  // walk doesn't haul them back to the Overview behind it.
  useEffect(() => {
    if (!last || !target) return;
    const onClick = (event: MouseEvent) => {
      if (!target.contains(event.target as Node)) return;
      onClose(true);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [last, target, onClose]);

  // A rotate or a keyboard opening moves everything, including the card,
  // and a stop with no lit element has no other reason to re-render.
  useEffect(() => {
    const onResize = () =>
      setView({ w: window.innerWidth, h: window.innerHeight, ...safeInsets() });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // The kit's scrim, ink at 40% by day and black at 60% at night, with no
  // blur: the page behind stays readable as the page it is.
  const scrim = "pointer-events-auto fixed bg-scrim";
  const { w: vw, h: vh } = view;
  // Centred with no box, or with none of it on screen: the dark below never
  // stands without the card standing over it. Placed inside the safe areas,
  // clear of the notch and the home indicator.
  const placed = cardSize
    ? placeCard(
        { width: vw, height: vh - view.top - view.bottom },
        cardSize,
        box && { ...box, top: box.top - view.top },
      )
    : null;
  const place = placed && { top: placed.top + view.top, left: placed.left };
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
    <div className="pointer-events-none fixed inset-0 z-50 text-ink">
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
          {/* The rim, in ink, and nothing else — pointer-events-none, or it
              would be the very thing the four panes were arranged to avoid. */}
          <div
            aria-hidden
            className="pointer-events-none fixed rounded-field ring-2 ring-ink"
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
          "pointer-events-auto fixed flex flex-col gap-3 rounded-panel border border-border bg-surface p-5 shadow-panel-lift outline-none",
          reduced ? "animate-gentle-in" : "animate-lights-on",
          !place && "invisible",
        )}
        style={{
          top: place?.top ?? 0,
          left: place?.left ?? 0,
          width: cardWidth(vw),
        }}
      >
        <div className="-mt-1 flex items-center justify-between gap-3">
          <p className="type-label text-ink-muted">{t("tour.title")}</p>
          <Button variant="quiet" onClick={finish} className="-me-3">
            {t("tour.skip")}
          </Button>
        </div>

        {/* One live region per stop, so moving on is announced as the
            sentence it is rather than as three unrelated changes — position
            first, because how much is left is the thing the stamps show and
            speech cannot. */}
        <div aria-live="polite" className="flex flex-col gap-2">
          <p className="sr-only">
            {t("tour.progress", { step: index + 1, total: steps.length })}
          </p>

          <h2 className="type-card-title flex items-center gap-2 text-ink">
            <step.Icon aria-hidden className="size-5 shrink-0" />
            {t(step.title)}
          </h2>

          {/* Where it lives, in the navigation's own words — the navigation
              itself is under the dark at this moment. */}
          <p className="type-label text-ink-muted">
            {t(`dashboard.groups.${step.group}`)} · {t(`dashboard.nav.${step.nav}`)}
          </p>

          <p className="type-body text-ink-muted">
            {/* The price reads left to right inside Hebrew. */}
            <Trans i18nKey={step.body} values={step.values} components={{ ltr: <bdi dir="ltr" /> }} />
          </p>

          {step.act && target && (
            <p className="type-body font-semibold text-ink">{t(step.act)}</p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
          {/* The card filling up, which is the one form this product already
              means something by. Decorative — the line above says it in
              words. */}
          <StampRow total={steps.length} filled={index + 1} className="max-w-[8.5rem] justify-start" />

          <div className="flex items-center gap-2">
            {index > 0 && (
              <Button variant="secondary" onClick={() => go(-1)}>
                {t("common.back")}
              </Button>
            )}
            <Button
              onClick={last ? finish : () => go(1)}
              iconEnd={last ? undefined : <ArrowRight aria-hidden className="rtl:-scale-x-100" />}
            >
              {last ? t("tour.done") : t("common.next")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
