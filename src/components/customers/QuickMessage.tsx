import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Send } from "lucide-react";
import { MESSAGE_LIMITS } from "../messaging/MessageForm";
import { ctaClasses, focusRing } from "../marketing/primitives";
import { fieldClasses } from "../dashboard/primitives";
import { cn } from "../../lib/cn";

/**
 * One message to one customer, composed in her own row.
 *
 * Deliberately not the `MessageForm` the rule editor and broadcast composer
 * share. That one is a rule being written — a title, a gift, placeholder
 * chips, a live notification preview — and all of it is scaffolding for
 * text that will be sent later, to people not yet known. This is the owner
 * answering one customer at the counter, and the whole interaction should
 * be: type the sentence, send it. A title and a gift picker here would be
 * three more decisions in front of "your order is ready".
 *
 * The limit is `MESSAGE_LIMITS.body`, imported rather than repeated, so it
 * cannot drift from the one the composer and the backend already agree on.
 */
export function QuickMessage({
  name,
  busy,
  onSend,
  onCancel,
}: {
  name: string;
  busy: boolean;
  onSend: (body: string) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const [body, setBody] = useState("");
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const title = t("dashboard.customers.message.title", { name });

  // The menu that opened this has closed and taken focus with it.
  useEffect(() => {
    fieldRef.current?.focus();
  }, []);

  const trimmed = body.trim();
  const remaining = MESSAGE_LIMITS.body - body.length;

  function submit() {
    if (!trimmed || busy) return;
    onSend(trimmed);
  }

  return (
    <div
      role="group"
      aria-label={title}
      onKeyDown={(e) => {
        if (e.key === "Escape" && !busy) {
          e.stopPropagation();
          onCancel();
        }
      }}
      className="flex flex-col gap-3 rounded-xl border border-border-strong bg-background p-4"
    >
      <p className="font-semibold text-ink">{title}</p>

      <textarea
        ref={fieldRef}
        rows={2}
        value={body}
        maxLength={MESSAGE_LIMITS.body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => {
          // Enter sends, Shift+Enter breaks the line. This is a message to a
          // person, not a document — the same bargain every chat box makes.
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        aria-label={title}
        aria-describedby="quick-message-hint"
        placeholder={t("dashboard.customers.message.placeholder")}
        className={cn(fieldClasses, "min-h-[68px] resize-none")}
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p id="quick-message-hint" className="text-xs text-ink-muted">
          {t("dashboard.customers.message.hint")}
        </p>
        {/* Only once it is close enough to matter — a counter that starts at
            160 is noise on a one-line message. */}
        {remaining <= 40 && (
          <p className="font-mono text-xs text-ink-subtle" dir="ltr">
            {t("dashboard.customers.message.remaining", { n: remaining })}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={busy || !trimmed}
          onClick={submit}
          className={ctaClasses("primary", "sm")}
        >
          <Send size={15} aria-hidden className="rtl:-scale-x-100" />
          {busy ? t("common.loading") : t("dashboard.customers.message.send")}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onCancel}
          className={cn(ctaClasses("secondary", "sm"), focusRing)}
        >
          {t("common.cancel")}
        </button>
      </div>
    </div>
  );
}
