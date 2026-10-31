import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import type { TokenPair } from "../../../api/auth";
import type { Business, CardTemplate } from "../../../api/businesses";
import { useAuth } from "../../../auth/useAuth";
import { isOwner, roleOf } from "../../../business/gating";
import { AuthAlternatives, AuthFields } from "../../../components/auth/AuthFormParts";
import { useEmailPasswordAuth } from "../../../components/auth/useEmailPasswordAuth";
import { rewardForRow } from "../../../components/card-studio/studioDraft";
import { Button, LinkButton, LitPanel, Loading, Notice, Skeleton } from "../../../components/kit";
import { StepHeading, StepShell } from "../../../components/onboarding/StepShell";
import { CardStage } from "../CardStage";
import { commitDraft } from "../commit";
import { saveProblem, type SaveProblem } from "../problems";
import { useStorageFull } from "../storageCheck";
import { StorageNotice } from "../StorageNotice";
import { useOnboardingDraft } from "../useOnboardingDraft";

const PANEL = "flex flex-col gap-5 p-5 sm:p-6";

/**
 * Saving the card: the third stop. Signed out it is Phase 8's sign-in form,
 * its parts as they are, in one lit panel under the top of the card; signed
 * in it is one button. Either way the press that ends it creates the
 * Business and the card from the draft (`commit.ts`): from a press only,
 * never from an effect, and never twice at once.
 *
 * Saving is the button, busy, in place, focus kept on it; the next screen's
 * heading takes it after. A save that fails is said by its cause, never in
 * the server's words. An account that already has a card says which card,
 * from what the save read, beside the one just designed, and what keeping
 * it costs.
 */
export function AccountStep() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading: authLoading, login, logout } = useAuth();
  const { draft, resolved, templateInput, art, artPersisted, update, clear } = useOnboardingDraft();
  const storageFull = useStorageFull(draft, artPersisted);
  const keepCostId = useId();
  const [committing, setCommitting] = useState(false);
  const [problem, setProblem] = useState<SaveProblem | null>(null);
  const [pressed, setPressed] = useState(false);
  const [existing, setExisting] = useState<{ business: Business; template: CardTemplate } | null>(null);
  const inFlight = useRef(false);
  const form = useRef<HTMLFormElement>(null);
  // What tries again: Save, or Replace. A save that failed puts focus there,
  // since a sign-up that saved nothing leaves the form for the signed-in
  // panel, and focus would otherwise fall to the page.
  const retry = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (problem) retry.current?.focus();
  }, [problem]);
  // "Use a different account" takes away the button that was pressed: the
  // email is what comes next.
  const [switching, setSwitching] = useState(false);
  useEffect(() => {
    if (!switching || isAuthenticated) return;
    setSwitching(false);
    form.current?.querySelector<HTMLInputElement>("input[type=email]")?.focus();
  }, [switching, isAuthenticated]);

  // A save that ends after the step has gone (the browser's own Back) moves
  // nobody: what it saved is in the draft's record either way.
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const artForUpload = resolved.stamp.kind !== "glyph" && art?.hash === resolved.stamp.hash ? art : null;

  async function commit(replaceExisting = false) {
    if (inFlight.current) return;
    inFlight.current = true;
    setCommitting(true);
    setProblem(null);
    try {
      const outcome = await commitDraft({
        draft,
        resolved,
        input: templateInput,
        art: artForUpload,
        queryClient,
        saveCommitted: (committed) => update({ committed }),
        replaceExisting,
      });
      if (!mounted.current) return;
      if (outcome.kind === "existing-card") {
        setExisting({ business: outcome.business, template: outcome.template });
        return;
      }
      navigate("/onboarding/wallet");
    } catch (err) {
      if (mounted.current) setProblem(saveProblem(err, resolved));
    } finally {
      inFlight.current = false;
      if (mounted.current) setCommitting(false);
    }
  }

  const auth = useEmailPasswordAuth({
    initialMode: "signup",
    onAuthenticated: async (tokens: TokenPair) => {
      login(tokens);
      await commit();
    },
  });

  const fieldsMissing = !auth.email.trim() || !auth.password;

  function submit(event: FormEvent) {
    event.preventDefault();
    setPressed(true);
    if (fieldsMissing) {
      const empty = auth.email.trim() ? "input[type=password]" : "input[type=email]";
      form.current?.querySelector<HTMLInputElement>(empty)?.focus();
      return;
    }
    void auth.submitPassword();
  }

  // A refusal placed on the card (the name, the stamp's picture) comes with
  // a way back to it.
  const problemNotice = problem && (
    <Notice
      tone="danger"
      role="alert"
      action={
        problem.fix === "name" ? (
          <LinkButton to="/onboarding/business" variant="secondary">
            {t("onboarding.account.problem.toName")}
          </LinkButton>
        ) : problem.fix === "stamp" ? (
          <LinkButton to="/onboarding/stamp" variant="secondary">
            {t("onboarding.account.problem.toPicture")}
          </LinkButton>
        ) : undefined
      }
    >
      {t(problem.key)}
    </Notice>
  );

  // While a save runs, nothing else on the step is acted on: leaving, keeping
  // the card the account has, or signing out would be undone, or overtaken,
  // by the save as it lands.
  const saving = () => inFlight.current || auth.submitting;

  const heading = (
    <StepHeading
      title={t("onboarding.account.title")}
      lead={t("onboarding.account.subtitle")}
      onBack={() => {
        if (!saving()) navigate("/onboarding/reward");
      }}
      // After "Use a different account" the email takes focus, not this.
      autoFocus={!switching}
    />
  );

  // Each state is its own panel (`key`), so its heading takes focus as the
  // state appears, the way each screen's does.
  let panel: ReactNode;
  if (existing && !isOwner(roleOf(existing.business))) {
    // A hire's account belongs to someone else's business: it can't save a
    // card of its own, and the card it can reach is the owner's. Nothing is
    // replaced or thrown away; the design stays on this device for an
    // account of the owner's own.
    panel = (
      <LitPanel key="hire" as="section" className={PANEL}>
        <StepHeading
          title={
            <Trans
              i18nKey="onboarding.account.hireTitle"
              values={{ business: existing.business.name }}
              components={{ b: <bdi /> }}
            />
          }
          lead={t("onboarding.account.hireBody")}
        />
        <div className="flex flex-col gap-3">
          <Button
            size="lg"
            onClick={() => {
              setExisting(null);
              setSwitching(true);
              void logout();
            }}
            className="w-full !whitespace-normal text-center"
          >
            {t("onboarding.account.switchAccount")}
          </Button>
          <LinkButton to="/dashboard" variant="secondary" size="lg" className="w-full !whitespace-normal text-center">
            {t("onboarding.account.toDashboard")}
          </LinkButton>
        </div>
      </LitPanel>
    );
  } else if (existing) {
    panel = (
      <LitPanel key="existing" as="section" className={PANEL}>
        <StepHeading title={t("onboarding.account.existingTitle")} lead={t("onboarding.account.existingBody")} />
        <ul className="flex flex-col gap-4">
          <CardLine
            label={t("onboarding.account.existingCard")}
            colour={existing.template.background_color}
            name={existing.template.name}
            reward={existing.template.reward_description}
            count={existing.template.stamps_required}
          />
          <CardLine
            label={t("onboarding.account.newDesign")}
            colour={resolved.background}
            name={templateInput.name}
            reward={resolved.reward}
            count={resolved.stampsRequired}
          />
        </ul>
        {problemNotice}
        <div className="flex flex-col gap-3">
          <Button
            ref={retry}
            size="lg"
            busy={committing}
            onClick={() => void commit(true)}
            className="w-full !whitespace-normal text-center"
          >
            {t("onboarding.account.replace")}
          </Button>
          <Button
            variant="secondary"
            size="lg"
            aria-describedby={keepCostId}
            onClick={() => {
              if (saving()) return;
              clear();
              navigate("/dashboard", { replace: true });
            }}
            className="w-full !whitespace-normal text-center"
          >
            {t("onboarding.account.keep")}
          </Button>
          <p id={keepCostId} className="type-body text-center text-ink-muted">
            {t("onboarding.account.keepCost")}
          </p>
        </div>
      </LitPanel>
    );
  } else if (authLoading) {
    panel = (
      <LitPanel key="loading" className="p-5 sm:p-6">
        <Loading className="flex flex-col gap-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-12 w-full !rounded-field" />
          <Skeleton className="h-12 w-full !rounded-field" />
        </Loading>
      </LitPanel>
    );
  } else if (!isAuthenticated || auth.submitting) {
    // The form, and still the form while a new account saves its card:
    // signing in flips the session halfway through, and the busy button
    // stays where the owner pressed it.
    panel = (
      <LitPanel key="form" as="section" className={PANEL}>
        {heading}
        <form ref={form} noValidate onSubmit={submit} className="flex flex-col gap-4">
          <AuthFields
            mode={auth.mode}
            email={auth.email}
            password={auth.password}
            onEmail={auth.setEmail}
            onPassword={auth.setPassword}
          />
          {pressed && fieldsMissing ? (
            <Notice tone="danger" role="alert">
              {t("onboarding.missing.account")}
            </Notice>
          ) : auth.error ? (
            <Notice tone="danger" role="alert">
              {auth.error}
            </Notice>
          ) : (
            problemNotice
          )}
          <Button type="submit" size="lg" busy={auth.submitting} className="w-full !whitespace-normal text-center">
            {auth.mode === "signup" ? t("onboarding.account.createCta") : t("onboarding.account.signInCta")}
          </Button>
        </form>
        <AuthAlternatives mode={auth.mode} onToggleMode={auth.toggleMode} onGoogle={auth.submitGoogle} />
      </LitPanel>
    );
  } else {
    panel = (
      <LitPanel key="signedIn" as="section" className={PANEL}>
        {heading}
        <p className="type-body text-ink">
          <Trans
            i18nKey="onboarding.account.signedInLine"
            values={{ email: user?.email ?? "" }}
            components={{ ltr: <bdi dir="ltr" /> }}
          />
        </p>
        {problemNotice}
        <div className="flex flex-col items-center gap-2">
          <Button
            ref={retry}
            size="lg"
            busy={committing}
            onClick={() => void commit()}
            className="w-full !whitespace-normal text-center"
          >
            {t("onboarding.account.saveCta")}
          </Button>
          <Button
            variant="quiet"
            onClick={() => {
              if (saving()) return;
              // What went wrong was this account's, not the next one's.
              setProblem(null);
              setSwitching(true);
              void logout();
            }}
          >
            {t("onboarding.account.switchAccount")}
          </Button>
        </div>
      </LitPanel>
    );
  }

  return (
    <StepShell cardFirst notice={<StorageNotice full={storageFull} />} card={<CardStage crop="top" />}>
      {panel}
      <p className="sr-only" role="status">
        {committing || (auth.submitting && isAuthenticated) ? t("onboarding.account.saving") : ""}
      </p>
    </StepShell>
  );
}

/** A card said in a line: its colour, its name and its reward. */
function CardLine({
  label,
  colour,
  name,
  reward,
  count,
}: {
  label: string;
  colour: string;
  name: string;
  reward: string;
  count: number;
}) {
  const { t } = useTranslation();
  return (
    <li className="flex items-start gap-3">
      <span
        aria-hidden
        className="mt-0.5 size-10 shrink-0 rounded-field ring-1 ring-inset ring-field"
        style={{ backgroundColor: colour }}
      />
      <span className="flex min-w-0 flex-col">
        <span className="type-label text-ink-muted">{label}</span>
        <bdi className="type-body font-semibold text-ink">{name}</bdi>
        <span className="type-body text-ink-muted">
          <Trans
            i18nKey="studio.rewardSentence"
            count={count}
            values={{ reward: rewardForRow(reward) || t("studio.noReward") }}
            components={{ b: <bdi /> }}
          />
        </span>
      </span>
    </li>
  );
}
