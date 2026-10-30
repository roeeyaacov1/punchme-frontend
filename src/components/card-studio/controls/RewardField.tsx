import { forwardRef, useCallback, useLayoutEffect, useRef, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Textarea } from "../../kit/Textarea";
import { charactersLeft, oneParagraph, REWARD_MAX } from "./controlRules";

/** The counter says nothing until the reward is this long. */
const COUNT_FROM = 160;

/** Two lines to begin with, growing to three; past that it scrolls inside. */
const LINES = { from: 2, to: 3 };

/** Sets the field's height to its words, between two and three lines. */
function fit(field: HTMLTextAreaElement) {
  const style = getComputedStyle(field);
  const line = parseFloat(style.lineHeight);
  const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
  const border = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
  field.style.height = "auto";
  const words = field.scrollHeight + border;
  const least = LINES.from * line + padding + border;
  const most = LINES.to * line + padding + border;
  field.style.height = `${Math.min(Math.max(words, least), most)}px`;
}

/**
 * What customers get, in the owner's own words: a paragraph of two lines that
 * grows to three, never a line break (Enter does what the screen's own action
 * does, and a pasted break is a space), `dir="auto"` once there are some
 * words (empty, it follows the page, or a Hebrew placeholder sits left), at
 * most the API's 200 characters, with a count of what is left once it nears
 * that.
 */
export const RewardField = forwardRef<
  HTMLTextAreaElement,
  {
    value: string;
    onChange: (next: string) => void;
    /** Said under the field, after the count: where else the reward shows. */
    note?: ReactNode;
    error?: ReactNode;
    /** What Enter does: the screen's own action. Without it, nothing. */
    onEnter?: () => void;
  }
>(function RewardField({ value, onChange, note, error, onEnter }, ref) {
  const { t } = useTranslation();
  const field = useRef<HTMLTextAreaElement | null>(null);
  const setField = useCallback(
    (element: HTMLTextAreaElement | null) => {
      field.current = element;
      if (typeof ref === "function") ref(element);
      else if (ref) ref.current = element;
    },
    [ref],
  );

  useLayoutEffect(() => {
    if (field.current) fit(field.current);
  }, [value]);

  // A narrower or wider column wraps the words again.
  useLayoutEffect(() => {
    const element = field.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    let width = element.offsetWidth;
    const observer = new ResizeObserver(() => {
      if (element.offsetWidth === width) return;
      width = element.offsetWidth;
      fit(element);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const left = charactersLeft(value, REWARD_MAX, COUNT_FROM);
  const hint =
    left === null && !note ? undefined : (
      <>
        {left !== null && <span className="block">{t("cardControls.charactersLeft", { count: left })}</span>}
        {note && <span className="block">{note}</span>}
      </>
    );
  return (
    <Textarea
      ref={setField}
      label={t("cardControls.reward")}
      rows={LINES.from}
      value={value}
      onChange={(event) => onChange(oneParagraph(event.target.value))}
      onKeyDown={(event) => {
        if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
        event.preventDefault();
        onEnter?.();
      }}
      maxLength={REWARD_MAX}
      dir={value ? "auto" : undefined}
      autoComplete="off"
      placeholder={t("onboarding.reward.rewardPlaceholder")}
      hint={hint}
      error={error}
      style={{ minHeight: 0, resize: "none" }}
    />
  );
});
