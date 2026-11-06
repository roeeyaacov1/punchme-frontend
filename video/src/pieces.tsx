import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { AbsoluteFill, Img, cancelRender, continueRender, delayRender } from "remotion";
import logo from "../../src/assets/logo.png";
import { cn } from "../../src/lib/cn";
import { fontsReady } from "./fonts";

/** The safe area: clear of WhatsApp's and Stories' own controls. */
export const SAFE = { top: 220, side: 80, bottom: 320 } as const;

/** The site's logo, 905 × 218, drawn as the header draws it: the PNG, its height set. */
const LOGO_RATIO = 905 / 218;

export function useHebrew(): boolean {
  const { i18n } = useTranslation();
  return i18n.language === "he";
}

/**
 * Holds every frame until the faces are loaded and checked, so the stand-ins
 * in `src/font-fallbacks.css` never reach a render.
 */
export function FontGate({ children }: { children: ReactNode }) {
  const [handle] = useState(() => delayRender("Loading Rubik, Assistant and Roboto"));
  const [ready, setReady] = useState(false);
  useLayoutEffect(() => {
    fontsReady()
      .then(() => {
        setReady(true);
        continueRender(handle);
      })
      .catch((error: unknown) => cancelRender(error));
  }, [handle]);
  return ready ? <>{children}</> : null;
}

/** A scene's box: the safe area, its content in one centred column. */
export function SafeArea({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <AbsoluteFill
      className={cn("flex flex-col items-center", className)}
      style={{ paddingTop: SAFE.top, paddingInline: SAFE.side, paddingBottom: SAFE.bottom, ...style }}
    >
      {children}
    </AbsoluteFill>
  );
}

/**
 * One of the app's components at its own size, scaled up evenly as a whole:
 * a pass stays in its 300px slot, its proportions and its insides untouched.
 * The box takes the scaled size, so the column lays out around it.
 */
export function Scaled({
  width,
  scale,
  children,
  overlay,
  className,
  style,
}: {
  /** The component's own width, in site pixels. */
  width: number;
  scale: number;
  children: ReactNode;
  /** Laid over the scaled box at frame size: its tag, a flash. */
  overlay?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const inner = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  // After every render, since what's inside can change height with the
  // frame; it sets state only when the height changed, so it settles.
  useLayoutEffect(() => {
    const measured = inner.current?.offsetHeight ?? 0;
    if (measured !== height) setHeight(measured);
  });
  return (
    <div className={cn("relative shrink-0", className)} style={{ width: width * scale, height: height * scale, ...style }}>
      <div
        ref={inner}
        style={{ position: "absolute", top: 0, left: 0, width, transform: `scale(${scale})`, transformOrigin: "top left" }}
      >
        {children}
      </div>
      {overlay}
    </div>
  );
}

/**
 * The name an object wears on the site, as a label stuck on its top edge
 * (or its foot): Hero.tsx's `Tag`, set at frame size, since the site's 13px
 * would be under the frame's 36px floor. Ink on the panel, 14.88:1.
 */
export function Tag({ children, foot = false, style }: { children: ReactNode; foot?: boolean; style?: CSSProperties }) {
  return (
    <span
      className="absolute z-10 inline-flex items-center whitespace-nowrap rounded-full border-[3px] border-border-strong bg-surface font-body font-semibold text-ink"
      style={{
        insetInlineStart: 32,
        ...(foot ? { bottom: -34 } : { top: -34 }),
        minHeight: 68,
        paddingInline: 28,
        fontSize: 40,
        lineHeight: 1.3,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/**
 * A line of copy broken where its sense breaks rather than where the width
 * runs out: after each sentence, and with `atComma` after its first comma
 * too. Each part is balanced on its own.
 */
export function Lines({ text, atComma = false }: { text: string; atComma?: boolean }) {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const parts = atComma && sentences.length === 1 ? splitAtComma(text) : sentences;
  return (
    <>
      {parts.map((part, index) => (
        <span key={index} className="block text-balance">
          {part}
        </span>
      ))}
    </>
  );
}

function splitAtComma(text: string): string[] {
  const at = text.indexOf(", ");
  return at < 0 ? [text] : [text.slice(0, at + 1), text.slice(at + 2)];
}

/** A scene's line: Rubik 500, ink on the wall, 13.54:1. A string breaks after each sentence. */
export function Caption({ children, size = 68, className, style }: { children: ReactNode; size?: number; className?: string; style?: CSSProperties }) {
  const hebrew = useHebrew();
  return (
    <p
      className={cn("text-balance text-center font-heading font-medium text-ink", className)}
      style={{
        fontSize: size,
        lineHeight: hebrew ? 1.25 : 1.15,
        letterSpacing: hebrew ? 0 : "-0.01em",
        ...style,
      }}
    >
      {typeof children === "string" ? <Lines text={children} /> : children}
    </p>
  );
}

/** The sentence under a line: Assistant 600, ink-muted on the wall, 7.27:1. */
export function Lead({ children, size = 54, className, style }: { children: ReactNode; size?: number; className?: string; style?: CSSProperties }) {
  const hebrew = useHebrew();
  return (
    <p
      className={cn("text-balance text-center font-body font-semibold text-ink-muted", className)}
      style={{ fontSize: size, lineHeight: hebrew ? 1.4 : 1.3, ...style }}
    >
      {children}
    </p>
  );
}

export function Logo({ height, style }: { height: number; style?: CSSProperties }) {
  const { t } = useTranslation();
  return <Img src={logo} alt={t("app.name")} style={{ height, width: height * LOGO_RATIO, ...style }} />;
}

/** A run that reads left to right inside Hebrew: a figure, the price, the address. */
export function Ltr({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <bdi dir="ltr" className={className}>
      {children}
    </bdi>
  );
}

/** Stacks its children in one cell, so lines can cross over where they stand. */
export function Stack({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div className={cn("grid w-full [&>*]:[grid-area:1/1]", className)} style={style}>
      {children}
    </div>
  );
}
