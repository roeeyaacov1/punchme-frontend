import { useEffect, useRef, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Send } from "lucide-react";
import { MESSAGE_LIMITS } from "../messaging/MessageForm";
import { Button } from "../kit/Button";
import { Textarea } from "../kit/Textarea";

/**
 * One message to one customer, written in their sheet.
 *
 * Deliberately not the `MessageForm` the rules and broadcasts share: that one
 * writes text for later and for people not yet known, with a title, a gift
 * and placeholders. This is the owner answering one customer, and the whole
 * of it should be: type the sentence, send it. The limit is
 * `MESSAGE_LIMITS.body`, imported so it can't drift from the composer's and
 * the backend's.
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
  const field = useRef<HTMLTextAreaElement>(null);
  const trimmed = body.trim();

  // Opened from a button that has just gone: the field is where to be.
  useEffect(() => {
    field.current?.focus();
  }, []);

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    if (!trimmed || busy) return;
    onSend(trimmed);
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <Textarea
        ref={field}
        label={t("dashboard.customers.message.title", { name })}
        hint={t("dashboard.customers.message.hint")}
        count={`${body.length}/${MESSAGE_LIMITS.body}`}
        rows={3}
        dir="auto"
        maxLength={MESSAGE_LIMITS.body}
        value={body}
        placeholder={t("dashboard.customers.message.placeholder")}
        onChange={(event) => setBody(event.target.value)}
        onKeyDown={(event) => {
          // Enter sends and Shift+Enter breaks the line: a message to a
          // person, not a document, the bargain every chat box makes.
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            submit();
          }
        }}
      />
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button variant="quiet" disabled={busy} onClick={onCancel}>
          {t("common.cancel")}
        </Button>
        <Button type="submit" variant="ink" busy={busy} disabled={!trimmed} icon={<Send aria-hidden className="rtl:-scale-x-100" />}>
          {t("dashboard.customers.message.send")}
        </Button>
      </div>
    </form>
  );
}
