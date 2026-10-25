import { useRef, useState, type Ref } from "react";
import { flushSync } from "react-dom";
import { Trans, useTranslation } from "react-i18next";
import { Copy, Share2 } from "lucide-react";
import { inviteUrl, type Invitation } from "../../../api/team";
import { Button, Input, useToast } from "../../../components/kit";
import { listDay } from "../format";
import { isolate } from "../problem";

/** A share menu to hand the link to: a phone's, with WhatsApp in it, or the
 * computer's own. Where there is none, Copy is the one thing to press. */
const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

/** The whole link, on an iPhone too: Safari there can take `select()` and
 * leave nothing selected, and answers to the range instead. */
function selectAll(field: HTMLInputElement) {
  field.select();
  field.setSelectionRange(0, field.value.length);
}

/**
 * An invitation that is ready to send: the link itself, in full, and the
 * two ways to hand it over, then what it is and what the hire will do.
 *
 * Nothing is copied by itself. The owner presses Share or Copy, so it is
 * never a guess what the clipboard holds, and a clipboard the browser
 * refuses (an iPhone after an awaited request, an in-app browser) leaves
 * the link selected in its field, with a line saying so, to copy by hand.
 * Shared by the invite, once the link is made, and an open invitation's
 * sheet.
 */
export function ReadyLink({
  invitation,
  businessName,
  actionRef,
  replaced,
}: {
  invitation: Invitation;
  businessName: string;
  /** On the first action, for a sheet that moves focus there. */
  actionRef?: Ref<HTMLButtonElement>;
  /** The address had an open link already, which this one cancelled. */
  replaced?: boolean;
}) {
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const field = useRef<HTMLInputElement>(null);
  const [refused, setRefused] = useState(false);
  const url = inviteUrl(invitation.accept_path);
  const role = t(`team.role.${invitation.role}`);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setRefused(false);
      toast.show({ tone: "ok", title: t("common.copied") });
    } catch {
      // The line is on the page before focus reaches the field, so a
      // screen reader hears it with the field rather than not at all.
      flushSync(() => setRefused(true));
      if (field.current) {
        field.current.focus();
        selectAll(field.current);
      }
    }
  }

  async function share() {
    // WhatsApp sets the line as a paragraph of its own, in the direction of
    // its first letter. So it opens on the dashboard's language's mark, and
    // the business's name, in whichever script, is isolated after it.
    const mark = i18n.dir() === "rtl" ? "‏" : "‎";
    const text = mark + t("team.ready.shareText", { business: isolate(businessName), role });
    try {
      await navigator.share({ text, url });
    } catch (error) {
      // Closed without sending: nothing to do. Refused (an in-app browser,
      // a computer with nothing to share to): Copy does it instead.
      if (error instanceof DOMException && error.name === "AbortError") return;
      await copy();
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Read only and selected on focus, so it can always be copied by
          hand. The panel's heading names it on screen. */}
      <Input
        ref={field}
        label={<span className="sr-only">{t("team.ready.linkLabel")}</span>}
        hint={refused ? t("team.ready.copyFailed") : undefined}
        readOnly
        dir="ltr"
        value={url}
        onFocus={(event) => selectAll(event.currentTarget)}
      />
      <div className="flex flex-wrap gap-3">
        {canShare && (
          <Button
            ref={actionRef}
            icon={<Share2 aria-hidden />}
            onClick={() => void share()}
            className="max-w-full !whitespace-normal text-center"
          >
            {t("team.ready.share")}
          </Button>
        )}
        <Button
          ref={canShare ? undefined : actionRef}
          variant={canShare ? "secondary" : "primary"}
          icon={<Copy aria-hidden />}
          onClick={() => void copy()}
          className="max-w-full !whitespace-normal text-center"
        >
          {t("common.copyLink")}
        </Button>
      </div>
      <div className="type-body flex flex-col gap-1 text-ink-muted">
        <p className="[overflow-wrap:anywhere]">
          {t("team.ready.until", { date: listDay(invitation.expires_at, i18n.language) })}{" "}
          {invitation.email ? (
            <Trans
              i18nKey="team.ready.locked"
              values={{ email: invitation.email }}
              components={{ who: <bdi dir="ltr" /> }}
            />
          ) : (
            t("team.ready.open", { role })
          )}
          {replaced && <> {t("team.ready.replaced")}</>}
        </p>
        <p>{t("team.ready.next")}</p>
      </div>
    </div>
  );
}
