import { useRef, useState, type RefObject } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { changeMemberRole, removeMember, type AssignableRole, type Member } from "../../../api/team";
import { Button, Dialog, RadioGroup, Sheet } from "../../../components/kit";
import { listDay } from "../format";
import { isolate } from "../problem";
import { Email } from "./Email";
import { roleOptions } from "./roles";
import { changeRefusalKey } from "./teamFacts";

/**
 * One person on the team: who they are, what they may do, and the way to
 * let them go.
 *
 * A tap on a role no longer saves by itself, so a slip of the thumb can't
 * demote a manager: "Save" waits until the role has changed. Removing asks
 * first, in a dialog that opens on "Cancel", and the dialog sits beside the
 * sheet rather than in it, as the kit asks. A refusal is said under the
 * control that failed, with the sheet left open.
 */
export function MemberSheet({
  businessId,
  businessName,
  member,
  open,
  onClose,
  returnFocus,
  removed,
  onSaved,
  onRemoved,
  onGone,
}: {
  businessId: string;
  businessName: string;
  /** Held by the page while the sheet is open, so it outlives a re-read. */
  member: Member | null;
  open: boolean;
  onClose: () => void;
  /** Where focus goes once the sheet has closed, when not back to the row. */
  returnFocus?: RefObject<HTMLElement>;
  /** The person has just been removed: the dialog's focus goes with the sheet's. */
  removed: boolean;
  onSaved: (member: Member) => void;
  onRemoved: (member: Member) => void;
  /** A 404: changed on another device, so the page reads the team again. */
  onGone: () => void;
}) {
  const { t, i18n } = useTranslation();
  const cancel = useRef<HTMLButtonElement>(null);
  const [asking, setAsking] = useState(false);
  const [removeProblem, setRemoveProblem] = useState<string | null>(null);

  // Each opening starts clean.
  const [openFor, setOpenFor] = useState<string | null>(null);
  const opening = open ? (member?.id ?? null) : null;
  if (opening !== openFor) {
    setOpenFor(opening);
    setAsking(false);
    setRemoveProblem(null);
  }

  const remove = useMutation({
    mutationFn: (person: Member) => removeMember(businessId, person.id!),
    onSuccess: (_out, person) => {
      setAsking(false);
      onRemoved(person);
    },
    onError: (error) => {
      // Back in the sheet, under "Remove from the team", with the person
      // still on screen while the owner reads why.
      const key = changeRefusalKey(error);
      setAsking(false);
      setRemoveProblem(key);
      if (key === "team.error.gone") onGone();
    },
  });

  return (
    <>
      <Sheet
        open={open}
        onClose={onClose}
        returnFocus={returnFocus}
        title={member ? <Email value={member.email} whole /> : ""}
        description={member ? t("team.member.joined", { date: listDay(member.joined_at, i18n.language) }) : undefined}
      >
        {member && (
          <MemberSheetBody
            key={member.id}
            businessId={businessId}
            member={member}
            onSaved={onSaved}
            onGone={onGone}
            removeProblem={removeProblem}
            onAskRemove={() => {
              setRemoveProblem(null);
              setAsking(true);
            }}
          />
        )}
      </Sheet>
      <Dialog
        open={asking}
        onClose={() => {
          if (!remove.isPending) setAsking(false);
        }}
        title={
          member ? (
            <Trans
              i18nKey="team.member.removeTitle"
              values={{ email: member.email }}
              components={{ who: <bdi dir="ltr" className="[overflow-wrap:anywhere]" /> }}
            />
          ) : (
            ""
          )
        }
        description={t("team.member.removeBody", { business: isolate(businessName) })}
        initialFocus={cancel}
        returnFocus={removed ? returnFocus : undefined}
        footer={
          <>
            <Button ref={cancel} variant="secondary" disabled={remove.isPending} onClick={() => setAsking(false)}>
              {t("common.cancel")}
            </Button>
            <Button variant="danger" busy={remove.isPending} onClick={() => member && remove.mutate(member)}>
              {t("team.member.removeConfirm")}
            </Button>
          </>
        }
      />
    </>
  );
}

function MemberSheetBody({
  businessId,
  member,
  onSaved,
  onGone,
  removeProblem,
  onAskRemove,
}: {
  businessId: string;
  member: Member;
  onSaved: (member: Member) => void;
  onGone: () => void;
  removeProblem: string | null;
  onAskRemove: () => void;
}) {
  const { t } = useTranslation();
  const [role, setRole] = useState(member.role as AssignableRole);
  const [problem, setProblem] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: (next: AssignableRole) => changeMemberRole(businessId, member.id!, next),
    onSuccess: (updated) => onSaved(updated),
    onError: (error) => {
      const key = changeRefusalKey(error);
      setProblem(key);
      if (key === "team.error.gone") onGone();
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <RadioGroup
          legend={t("team.member.role")}
          options={roleOptions(t)}
          value={role}
          onChange={(next) => {
            setRole(next);
            setProblem(null);
          }}
        />
        <div className="flex flex-col items-start gap-2">
          <Button disabled={role === member.role} busy={save.isPending} onClick={() => save.mutate(role)}>
            {t("common.save")}
          </Button>
          {problem && (
            <p role="alert" className="text-sm font-semibold leading-snug text-danger">
              {t(problem)}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-col items-start gap-2 border-t border-border pt-5">
        <Button variant="danger" onClick={onAskRemove} className="max-w-full !whitespace-normal text-center">
          {t("team.member.remove")}
        </Button>
        {removeProblem && (
          <p role="alert" className="text-sm font-semibold leading-snug text-danger">
            {t(removeProblem)}
          </p>
        )}
      </div>
    </div>
  );
}
