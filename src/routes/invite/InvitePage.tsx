import { useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TokenPair } from "../../api/auth";
import { ApiError } from "../../api/errors";
import { acceptInvitation, getInvitationPreview, type InvitationPreview } from "../../api/team";
import { useAuth } from "../../auth/useAuth";
import { AuthAlternatives, AuthFields } from "../../components/auth/AuthFormParts";
import { useEmailPasswordAuth } from "../../components/auth/useEmailPasswordAuth";
import {
  Badge,
  Button,
  LinkButton,
  LitPanel,
  Loading,
  Notice,
  Skeleton,
  linkText,
} from "../../components/kit";
import { cn } from "../../lib/cn";
import { PublicPage } from "../public/PublicPage";

/** An address set left to right inside a Hebrew sentence, its "ל-" kept
 * with the Hebrew around it. */
const address = <bdi dir="ltr" />;

/**
 * The other end of the link the owner sent over WhatsApp.
 *
 * It has to work for someone who has never heard of this product and has no
 * account, so it says whose shop this is and what they are being asked to be
 * BEFORE asking for anything — the preview endpoint is public for exactly
 * that reason. Signing in happens on this page rather than at /login, so the
 * context that made the link worth clicking is still on screen while they
 * type. The invitation leads, then the account.
 */
export function InvitePage() {
  const { t, i18n } = useTranslation();
  const { token = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: sessionLoading, user, login, logout } = useAuth();

  const [accepting, setAccepting] = useState(false);
  const [refusal, setRefusal] = useState<ReactNode>(null);
  const [wrongAccount, setWrongAccount] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const [switched, setSwitched] = useState(false);

  const preview = useQuery({
    queryKey: ["invitation", token],
    queryFn: () => getInvitationPreview(token),
    enabled: !!token,
    retry: false,
    // Signing out clears the query cache; the invitation stays on screen
    // while the same read comes back.
    placeholderData: keepPreviousData,
  });
  const invitation = preview.data;

  /** A refusal in the page's words, never the server's. */
  function describe(err: unknown): ReactNode {
    if (err instanceof ApiError) {
      if (err.code === "invitation_email_mismatch") {
        return invitation?.masked_email ? (
          <Trans
            i18nKey="invite.error.wrongAccount"
            values={{ email: invitation.masked_email }}
            components={{ email: address }}
          />
        ) : (
          t("invite.error.generic")
        );
      }
      if (err.code === "already_a_member") return t("invite.error.alreadyIn");
      if (err.code === "invitation_unusable") {
        const reason = String(err.extra.reason ?? "");
        return t(`invite.dead.${reason}`, { defaultValue: t("invite.dead.revoked") });
      }
    }
    return t("invite.error.generic");
  }

  /** The one thing this page does. Shared by both doors into it: the button
   * a signed-in person taps, and the sign-in form's success path. */
  async function accept() {
    if (accepting) return;
    setRefusal(null);
    setWrongAccount(false);
    setAccepting(true);
    try {
      await acceptInvitation(token);
      // The business they just joined is the one the dashboard will ask for
      // next, and a cached 404 from before they had one would send them
      // round to the onboarding wizard instead.
      await queryClient.invalidateQueries({ queryKey: ["business", "me"] });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setWrongAccount(err instanceof ApiError && err.code === "invitation_email_mismatch");
      setRefusal(describe(err));
    } finally {
      setAccepting(false);
    }
  }

  const auth = useEmailPasswordAuth({
    initialMode: "signup",
    onAuthenticated: async (tokens: TokenPair) => {
      login(tokens);
      await accept();
    },
  });

  /** Signed in as someone else: sign out here (the session is revoked on the
   * server too) and offer the sign-in form, the invitation still above it. */
  function switchAccount() {
    setRefusal(null);
    setWrongAccount(false);
    logout();
    if (auth.mode === "signup") auth.toggleMode();
    setSwitched(true);
  }

  // The form takes the button's place, so focus goes to its first field
  // rather than falling to the page.
  useEffect(() => {
    if (!switched || isAuthenticated) return;
    form.current?.querySelector("input")?.focus();
    setSwitched(false);
  }, [switched, isAuthenticated]);

  const loading = (preview.isLoading && !invitation) || sessionLoading;
  const title = invitation
    ? t("invite.pageTitle", { business: invitation.business_name })
    : t("invite.pageTitleLoading");

  if (loading) {
    return (
      <InviteFrame title={t("invite.pageTitleLoading")}>
        <LitPanel as="section" className="p-5 sm:p-6">
          <Loading className="flex flex-col gap-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-24 !rounded-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </Loading>
        </LitPanel>
      </InviteFrame>
    );
  }

  if (preview.isError || !invitation) {
    return (
      <InviteFrame title={t("invite.dead.title")}>
        <Dead body={t("invite.dead.unknown")} />
      </InviteFrame>
    );
  }

  if (invitation.status !== "pending") {
    return (
      <InviteFrame title={t("invite.dead.title")}>
        <Dead
          body={t(`invite.dead.${invitation.status}`, { defaultValue: t("invite.dead.revoked") })}
          action={
            invitation.status === "accepted" ? (
              <LinkButton to="/login" variant="secondary" className="self-start">
                {t("auth.signInCta")}
              </LinkButton>
            ) : null
          }
        />
      </InviteFrame>
    );
  }

  return (
    <InviteFrame title={title}>
      <LitPanel as="section" aria-labelledby="invite-title" className="flex flex-col gap-5 p-5 sm:p-6">
        <Invitation invitation={invitation} language={i18n.resolvedLanguage ?? "he"} />

        {isAuthenticated ? (
          <div className="flex flex-col gap-4">
            <p className="type-body text-ink-muted">
              <Trans
                i18nKey="invite.signedInAs"
                values={{ email: user?.email ?? "" }}
                components={{ email: address }}
              />
            </p>
            {refusal && (
              <Notice
                tone="danger"
                role="alert"
                action={
                  wrongAccount ? (
                    <Button variant="secondary" onClick={switchAccount}>
                      {t("invite.switchShort")}
                    </Button>
                  ) : null
                }
              >
                {refusal}
              </Notice>
            )}
            <Button size="lg" busy={accepting} onClick={() => void accept()} className="w-full">
              {t("invite.joinCta")}
            </Button>
            <button
              type="button"
              onClick={switchAccount}
              className={cn(linkText, "type-body inline-flex min-h-11 items-center self-center px-2")}
            >
              {t("invite.switch")}
            </button>
          </div>
        ) : (
          <>
            <form
              ref={form}
              noValidate
              onSubmit={(event) => {
                event.preventDefault();
                if (auth.canSubmit) void auth.submitPassword();
              }}
              className="flex flex-col gap-4"
            >
              <AuthFields
                mode={auth.mode}
                email={auth.email}
                password={auth.password}
                onEmail={auth.setEmail}
                onPassword={auth.setPassword}
              />
              {(refusal ?? auth.error) && (
                <Notice tone="danger" role="alert">
                  {refusal ?? auth.error}
                </Notice>
              )}
              <Button
                type="submit"
                size="lg"
                busy={auth.submitting || accepting}
                disabled={!auth.canSubmit}
                className="w-full"
              >
                {auth.mode === "signup" ? t("invite.signUpCta") : t("invite.signInCta")}
              </Button>
            </form>
            <AuthAlternatives
              mode={auth.mode}
              onToggleMode={auth.toggleMode}
              onGoogle={auth.submitGoogle}
              onGoogleError={() => auth.setError(t("auth.error"))}
            />
          </>
        )}
      </LitPanel>
    </InviteFrame>
  );
}

/** Whose shop, which role, what it opens, until when, and for whom: all of
 * it before any field. The heading takes focus when it mounts. */
function Invitation({ invitation, language }: { invitation: InvitationPreview; language: string }) {
  const { t } = useTranslation();
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, []);
  const expires = new Date(invitation.expires_at);
  return (
    <div className="flex flex-col items-start gap-3">
      <h1 ref={heading} id="invite-title" tabIndex={-1} className="type-title text-balance outline-none">
        <Trans
          i18nKey="invite.title"
          values={{ business: invitation.business_name }}
          components={{ shop: <bdi /> }}
        />
      </h1>
      <Badge>{t(`team.role.${invitation.role}`)}</Badge>
      <p className="type-body text-pretty text-ink-muted">{t(`team.roleBody.${invitation.role}`)}</p>
      {!Number.isNaN(expires.getTime()) && (
        <p className="type-body text-ink-muted">
          {t("invite.expires", {
            date: new Intl.DateTimeFormat(language, { day: "numeric", month: "long" }).format(expires),
          })}
        </p>
      )}
      {/* Named invitations only work for the address they name, so the
          masked hint is what stops someone signing up with the wrong
          account and being refused after the fact. */}
      {invitation.masked_email && (
        <p className="type-body text-ink-muted">
          <Trans
            i18nKey="invite.forAddress"
            values={{ email: invitation.masked_email }}
            components={{ email: address }}
          />
        </p>
      )}
    </div>
  );
}

/** A link that doesn't work: why, and what to do about it. */
function Dead({ body, action }: { body: string; action?: ReactNode }) {
  const { t } = useTranslation();
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, []);
  return (
    <LitPanel as="section" aria-labelledby="invite-dead" className="flex flex-col gap-3 p-5 sm:p-6">
      <h1 ref={heading} id="invite-dead" tabIndex={-1} className="type-title text-balance outline-none">
        {t("invite.dead.title")}
      </h1>
      <p className="type-body text-pretty text-ink-muted">{body}</p>
      {action}
    </LitPanel>
  );
}

/** The frame every state stands in: the team's top bar, then the column, at
 * most 26rem and centred from 640px, as on /login. */
function InviteFrame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <PublicPage variant="team" title={title} className="items-stretch pb-16 pt-2 sm:items-center sm:pt-8">
      <div className="flex w-full flex-col sm:max-w-[26rem]">{children}</div>
    </PublicPage>
  );
}
