import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { TokenPair } from "../../api/auth";
import { ApiError } from "../../api/errors";
import { acceptInvitation, getInvitationPreview } from "../../api/team";
import { useAuth } from "../../auth/useAuth";
import { AuthAlternatives, AuthFields } from "../../components/auth/AuthFormParts";
import { useEmailPasswordAuth } from "../../components/auth/useEmailPasswordAuth";
import { StepShell } from "../../components/onboarding/StepShell";
import { TopBar } from "../../components/onboarding/TopBar";

/**
 * The other end of the link the owner sent over WhatsApp.
 *
 * It has to work for someone who has never heard of this product and has no
 * account, so it says whose shop this is and what they are being asked to be
 * BEFORE asking for anything — the preview endpoint is public for exactly
 * that reason. Signing in happens on this page rather than at /login, so the
 * context that made the link worth clicking is still on screen while they
 * type.
 *
 * Same paper panel and top bar as the wizard and the sign-in page: whatever
 * this person's first screen is, it should be the same product.
 */
export function InvitePage() {
  const { t } = useTranslation();
  const { token = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: sessionLoading, user, login } = useAuth();

  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preview = useQuery({
    queryKey: ["invitation", token],
    queryFn: () => getInvitationPreview(token),
    enabled: !!token,
    retry: false,
  });

  function describe(err: unknown): string {
    if (err instanceof ApiError) {
      if (err.code === "invitation_email_mismatch") return t("invite.error.wrongAccount");
      if (err.code === "already_a_member") return t("invite.error.alreadyIn");
      if (err.code === "invitation_unusable") {
        const reason = String(err.extra.reason ?? "");
        return t(`invite.dead.${reason}`, { defaultValue: t("invite.dead.revoked") });
      }
      return err.message;
    }
    return t("invite.error.generic");
  }

  /** The one thing this page does. Shared by both doors into it: the button
   * a signed-in person taps, and the sign-in form's success path. */
  async function accept() {
    if (accepting) return;
    setError(null);
    setAccepting(true);
    try {
      await acceptInvitation(token);
      // The business they just joined is the one the dashboard will ask for
      // next, and a cached 404 from before they had one would send them
      // round to the onboarding wizard instead.
      await queryClient.invalidateQueries({ queryKey: ["business", "me"] });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(describe(err));
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

  const invitation = preview.data;
  const roleName = invitation ? t(`team.role.${invitation.role}`) : "";

  return (
    <div className="theme-purple theme-raised min-h-screen bg-background text-ink">
      <TopBar />
      <main className="mx-auto w-full max-w-md px-3 pb-16 sm:max-w-lg sm:px-0">
        <section className="rounded-2xl border border-border bg-surface px-5 py-7 shadow-card sm:px-8">
          {preview.isLoading || sessionLoading ? (
            <p className="py-6 text-center font-mono text-sm text-ink-subtle">
              {t("common.loading")}
            </p>
          ) : preview.isError || !invitation ? (
            <StepShell title={t("invite.dead.title")} subtitle={t("invite.dead.unknown")} hideNext />
          ) : invitation.status !== "pending" ? (
            <StepShell
              title={t("invite.dead.title")}
              subtitle={t(`invite.dead.${invitation.status}`, {
                defaultValue: t("invite.dead.revoked"),
              })}
              hideNext
            />
          ) : isAuthenticated ? (
            <StepShell
              title={t("invite.title", { business: invitation.business_name })}
              subtitle={t("invite.asRole", { role: roleName })}
              onNext={() => void accept()}
              nextLabel={t("invite.joinCta")}
              nextBusy={accepting}
              error={error}
            >
              <p className="text-sm text-ink-muted">
                {t("invite.signedInAs", { email: user?.email ?? "" })}
              </p>
              <p className="text-sm text-ink-muted">{t(`team.roleBody.${invitation.role}`)}</p>
            </StepShell>
          ) : (
            <StepShell
              title={t("invite.title", { business: invitation.business_name })}
              subtitle={t("invite.asRoleSignIn", { role: roleName })}
              onNext={() => auth.submitPassword()}
              nextLabel={
                auth.mode === "signup" ? t("invite.signUpCta") : t("invite.signInCta")
              }
              nextBusy={auth.submitting || accepting}
              nextDisabled={!auth.canSubmit}
              error={error ?? auth.error}
              footer={
                <AuthAlternatives
                  mode={auth.mode}
                  onToggleMode={auth.toggleMode}
                  onGoogle={auth.submitGoogle}
                  onGoogleError={() => auth.setError(t("auth.error"))}
                />
              }
            >
              {/* Named invitations only work for the address they name, so
                  the masked hint is what stops someone signing up with the
                  wrong account and being refused after the fact. */}
              {invitation.masked_email && (
                <p className="text-sm text-ink-muted" dir="ltr">
                  {t("invite.forAddress", { email: invitation.masked_email })}
                </p>
              )}
              <p className="text-sm text-ink-muted">{t(`team.roleBody.${invitation.role}`)}</p>
              <AuthFields
                idPrefix="invite"
                mode={auth.mode}
                email={auth.email}
                password={auth.password}
                onEmail={auth.setEmail}
                onPassword={auth.setPassword}
              />
            </StepShell>
          )}
        </section>
      </main>
    </div>
  );
}
