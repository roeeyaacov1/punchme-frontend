import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { Link2 } from "lucide-react";
import { createInvitation, type AssignableRole, type Invitation, type Team } from "../../../api/team";
import { Badge, Button, Checkbox, Input, LitPanel, RadioGroup, useReducedMotion } from "../../../components/kit";
import { ReadyLink } from "./ReadyLink";
import { roleOptions } from "./roles";
import { inviteRefusalKey, looksLikeEmail } from "./teamFacts";

/**
 * The page's one action, so it leads: make a link, and it turns into the
 * link where it was made.
 *
 * The form asks two things. What the hire may do, each role with what it
 * opens. And whether the link is for one address: unticked, the honest cost
 * is said under it (whoever opens it first joins); ticked, the address
 * field opens with what it means, so the word "email" appears only where
 * the page also says nothing is sent to it.
 *
 * Once the link exists the form is gone, and with it the button that would
 * make a second open link on a second press. Focus goes to the new heading,
 * and a polite region says the link is ready.
 */
export function InvitePanel({
  businessId,
  businessName,
  team,
  onMade,
}: {
  businessId: string;
  businessName: string;
  /** The team as the page holds it, which tells the two caps apart. */
  team: Team | undefined;
  onMade: (invitation: Invitation) => void;
}) {
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const headingId = useId();
  const heading = useRef<HTMLHeadingElement>(null);
  const emailField = useRef<HTMLInputElement>(null);
  const [role, setRole] = useState<AssignableRole>("staff");
  const [locked, setLocked] = useState(false);
  const [email, setEmail] = useState("");
  const [emailWrong, setEmailWrong] = useState(false);
  const [refusal, setRefusal] = useState<string | null>(null);
  const [made, setMade] = useState<Invitation | null>(null);

  // A link cancelled from its sheet, or already used, is no longer ready:
  // the form comes back, and focus stays wherever the owner is. Only once
  // the link has been on the list, since the list hears of a new one a
  // moment after this panel does.
  const [listed, setListed] = useState(false);
  const onList = !!made && !!team && team.invitations.some((one) => one.id === made.id);
  if (onList && !listed) setListed(true);
  if (made && team && !onList && listed) {
    setListed(false);
    setMade(null);
  }

  // The panel lights on each time it turns, from the first link on: the
  // link where the form was, and the form where the link was. Never as the
  // page opens.
  const [turned, setTurned] = useState(false);
  if (made && !turned) setTurned(true);

  // Focus follows the panel from the form to the link and back when the
  // owner moved it, and never as the page opens. When the list took the
  // link away, focus stays where the owner is, unless it was on the link
  // itself (Copy, say, on the way back from WhatsApp): then the form's
  // heading takes it rather than the page's <body>.
  const focusNext = useRef(false);
  const shown = useRef(made);
  useEffect(() => {
    if (shown.current === made) return;
    shown.current = made;
    const owned = focusNext.current;
    focusNext.current = false;
    const lost = !document.activeElement || document.activeElement === document.body;
    if (owned || lost) heading.current?.focus();
  }, [made]);

  const create = useMutation({
    mutationFn: (input: { role: AssignableRole; email: string }) => createInvitation(businessId, input),
    onSuccess: (invitation) => {
      // The form behind the link is empty again, for whenever it comes back.
      setRole("staff");
      setLocked(false);
      setEmail("");
      setRefusal(null);
      focusNext.current = true;
      setListed(false);
      setMade(invitation);
      onMade(invitation);
    },
    onError: (error) => setRefusal(inviteRefusalKey(error, team)),
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    const address = locked ? email.trim() : "";
    // The API takes any string, so the shape is checked here, before a
    // link nobody could accept exists.
    if (locked && !looksLikeEmail(address)) {
      setEmailWrong(true);
      emailField.current?.focus();
      return;
    }
    setEmailWrong(false);
    create.mutate({ role, email: address });
  }

  function another() {
    focusNext.current = true;
    setListed(false);
    setMade(null);
  }

  return (
    <>
      {/* Beside the panel rather than in it: the panel is new each time it
          turns, and a region has to be there already to be heard. */}
      <p aria-live="polite" className="sr-only">
        {made ? t("team.ready.title") : ""}
      </p>
      <LitPanel
        key={made?.id ?? "form"}
        arrive={turned}
        as="section"
        aria-labelledby={headingId}
        className="flex flex-col gap-4 p-5 sm:p-6"
      >
        {made ? (
          <>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h2 id={headingId} ref={heading} tabIndex={-1} className="type-card-title text-ink outline-none">
                {t("team.ready.title")}
              </h2>
              <Badge>{t(`team.role.${made.role}`)}</Badge>
            </div>
            <ReadyLink invitation={made} businessName={businessName} />
            <Button variant="quiet" onClick={another} className="max-w-full self-start !whitespace-normal text-center">
              {t("team.ready.another")}
            </Button>
          </>
        ) : (
          <>
            <h2 id={headingId} ref={heading} tabIndex={-1} className="type-card-title text-ink outline-none">
              {t("team.invite.title")}
            </h2>
            {/* A form so Enter in the address makes the link; `noValidate`
                so the page's own check speaks, in the page's language,
                rather than the browser's bubble. */}
            <form noValidate onSubmit={submit} className="flex flex-col gap-4">
              <RadioGroup
                legend={t("team.invite.roleLabel")}
                options={roleOptions(t)}
                value={role}
                onChange={setRole}
              />
              <div className="flex flex-col gap-2">
                <Checkbox
                  checked={locked}
                  onChange={(next) => {
                    setLocked(next);
                    setEmailWrong(false);
                  }}
                  label={t("team.invite.lock")}
                  description={locked ? undefined : t("team.invite.openHint")}
                />
                {/* Lights on as the box opens it, as a field a choice opens
                    does across the dashboard, and goes at once when the box
                    is unticked. Only a hand ticks it: the form never comes
                    back ticked. */}
                {locked && (
                  <Input
                    ref={emailField}
                    className={reduced ? "animate-gentle-in" : "animate-lights-on"}
                    label={t("team.invite.emailLabel")}
                    hint={t("team.invite.lockHint")}
                    error={emailWrong ? t("team.error.badEmail") : undefined}
                    type="email"
                    inputMode="email"
                    autoComplete="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    dir="ltr"
                    placeholder={t("team.invite.emailPlaceholder")}
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (emailWrong) setEmailWrong(false);
                    }}
                  />
                )}
              </div>
              <div className="flex flex-col items-start gap-2">
                <Button
                  type="submit"
                  busy={create.isPending}
                  icon={<Link2 aria-hidden />}
                  className="max-w-full !whitespace-normal text-center"
                >
                  {t("team.invite.cta")}
                </Button>
                {refusal && (
                  <p role="alert" className="text-sm font-semibold leading-snug text-danger">
                    {t(refusal)}
                  </p>
                )}
              </div>
            </form>
          </>
        )}
      </LitPanel>
    </>
  );
}
