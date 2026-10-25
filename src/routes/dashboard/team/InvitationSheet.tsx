import { useEffect, useRef, useState, type RefObject } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import {
  createInvitation,
  revokeInvitation,
  type AssignableRole,
  type Invitation,
  type Team,
} from "../../../api/team";
import { Button, Sheet } from "../../../components/kit";
import { listDay } from "../format";
import { Email } from "./Email";
import { ReadyLink } from "./ReadyLink";
import { changeRefusalKey, inviteRefusalKey } from "./teamFacts";

/**
 * One open invitation: the ready link again, to send it a second time, and
 * the way to cancel it. Cancelling asks nothing, because a new link undoes
 * it.
 *
 * An expired one says when it ran out and offers a new link with the same
 * role and address. The new one is made first and the old one cancelled
 * after, and only when it was open to anyone: inviting an address again
 * cancels its earlier link on the server by itself. The sheet then holds
 * the new link, ready to send, since that is the next thing to do.
 */
export function InvitationSheet({
  businessId,
  businessName,
  team,
  invitation,
  open,
  onClose,
  returnFocus,
  onCancelled,
  onRenewed,
  onGone,
}: {
  businessId: string;
  businessName: string;
  team: Team | undefined;
  /** Held by the page while the sheet is open, so it outlives a re-read. */
  invitation: Invitation | null;
  open: boolean;
  onClose: () => void;
  returnFocus?: RefObject<HTMLElement>;
  /** Cancelled, or an expired one taken off the list. */
  onCancelled: (invitation: Invitation) => void;
  onRenewed: (old: Invitation, fresh: Invitation) => void;
  onGone: () => void;
}) {
  const { t, i18n } = useTranslation();
  const action = useRef<HTMLButtonElement>(null);
  const [renewed, setRenewed] = useState<Invitation | null>(null);
  const [problem, setProblem] = useState<string | null>(null);

  // Each opening starts clean.
  const [openFor, setOpenFor] = useState<string | null>(null);
  const opening = open ? (invitation?.id ?? null) : null;
  if (opening !== openFor) {
    setOpenFor(opening);
    setRenewed(null);
    setProblem(null);
  }
  const current = renewed ?? invitation;

  // The renewed link takes the place of the button that made it, so focus
  // goes to its first way of sending.
  useEffect(() => {
    if (renewed) action.current?.focus();
  }, [renewed]);

  const revoke = useMutation({
    mutationFn: (which: Invitation) => revokeInvitation(businessId, which.id),
    onSuccess: (_out, which) => onCancelled(which),
    onError: (error) => {
      const key = changeRefusalKey(error);
      setProblem(key);
      if (key === "team.error.gone") onGone();
    },
  });

  const renew = useMutation({
    mutationFn: async (old: Invitation) => {
      const fresh = await createInvitation(businessId, { role: old.role as AssignableRole, email: old.email });
      // The new link exists either way; an old one that won't go stays on
      // the list, where it can be taken off by hand.
      if (!old.email) await revokeInvitation(businessId, old.id).catch(() => undefined);
      return fresh;
    },
    onSuccess: (fresh, old) => {
      setProblem(null);
      setRenewed(fresh);
      onRenewed(old, fresh);
    },
    onError: (error) => setProblem(inviteRefusalKey(error, team)),
  });

  const expired = current?.status === "expired";
  const failed = problem && (
    <p role="alert" className="text-sm font-semibold leading-snug text-danger">
      {t(problem)}
    </p>
  );

  return (
    <Sheet
      open={open}
      onClose={onClose}
      returnFocus={returnFocus}
      title={current ? current.email ? <Email value={current.email} whole /> : t("team.pending.anyone") : ""}
      description={current ? t(`team.role.${current.role}`) : undefined}
    >
      {current && (
        <>
          <p aria-live="polite" className="sr-only">
            {renewed ? t("team.ready.title") : ""}
          </p>
          {expired ? (
            <div className="flex flex-col items-start gap-4">
              <p className="type-body text-ink">
                {t("team.invitation.expiredLine", { date: listDay(current.expires_at, i18n.language) })}
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  busy={renew.isPending}
                  onClick={() => renew.mutate(current)}
                  className="max-w-full !whitespace-normal text-center"
                >
                  {t("team.invitation.renew")}
                </Button>
                <Button
                  variant="secondary"
                  busy={revoke.isPending}
                  onClick={() => revoke.mutate(current)}
                  className="max-w-full !whitespace-normal text-center"
                >
                  {t("team.invitation.remove")}
                </Button>
              </div>
              {failed}
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <ReadyLink invitation={current} businessName={businessName} actionRef={action} />
              <div className="flex flex-col items-start gap-2 border-t border-border pt-5">
                <Button
                  variant="danger"
                  busy={revoke.isPending}
                  onClick={() => revoke.mutate(current)}
                  className="max-w-full !whitespace-normal text-center"
                >
                  {t("team.pending.revoke")}
                </Button>
                {failed}
              </div>
            </div>
          )}
        </>
      )}
    </Sheet>
  );
}
