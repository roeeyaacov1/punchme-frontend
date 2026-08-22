import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Copy, Link2, Trash2 } from "lucide-react";
import {
  Notice,
  Panel,
  PanelHeader,
  SegmentedControl,
  Tag,
  fieldClasses,
} from "../../components/dashboard/primitives";
import { ctaClasses, focusRing } from "../../components/marketing/primitives";
import { useBusiness } from "../../business/useBusiness";
import { ApiError } from "../../api/errors";
import {
  changeMemberRole,
  createInvitation,
  getTeam,
  inviteUrl,
  removeMember,
  revokeInvitation,
  type AssignableRole,
  type Invitation,
  type Member,
} from "../../api/team";
import { cn } from "../../lib/cn";

/**
 * Who else can work here.
 *
 * The owner's mental model is a shop, not an access-control matrix, so the
 * page is written as one: a row per person, a plain sentence per role, and
 * one thing to do — make a link and send it. There is no email delivery in
 * this product; the owner copies the link and sends it the way they already
 * talk to the person they just hired.
 *
 * Two things are said out loud rather than assumed. What each role can
 * actually reach, next to the picker, because "Manager" means nothing on its
 * own. And what leaving the email blank costs: the link alone is then the
 * credential, so anyone it reaches can walk in.
 */
export function TeamPage() {
  const { t } = useTranslation();
  const { business } = useBusiness();
  const queryClient = useQueryClient();
  const businessId = business?.id ?? "";

  const [role, setRole] = useState<AssignableRole>("staff");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);

  const teamQuery = useQuery({
    queryKey: ["team", businessId],
    queryFn: () => getTeam(businessId),
    enabled: !!businessId,
  });

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: ["team", businessId] });
  }

  /** One reading of the API's refusals for every mutation on this page —
   * the codes are the backend's own, so a new one surfaces its `detail`
   * rather than a shrug. */
  function describe(err: unknown): string {
    if (err instanceof ApiError) {
      if (err.code === "already_a_member") return t("team.error.alreadyMember");
      if (err.code === "team_cap_reached") return t("team.error.capReached");
      if (err.code === "insufficient_role") return t("team.error.notOwner");
      if (err.status === 422) return t("team.error.badEmail");
      return err.message;
    }
    return t("team.error.generic");
  }

  const invite = useMutation({
    mutationFn: () =>
      createInvitation(businessId, { role, email: email.trim() }),
    onSuccess: (created) => {
      setError(null);
      setEmail("");
      refresh();
      void copy(created);
    },
    onError: (err) => setError(describe(err)),
  });

  const revoke = useMutation({
    mutationFn: (invitationId: string) => revokeInvitation(businessId, invitationId),
    onSuccess: refresh,
    onError: (err) => setError(describe(err)),
  });

  const changeRole = useMutation({
    mutationFn: (input: { membershipId: string; role: AssignableRole }) =>
      changeMemberRole(businessId, input.membershipId, input.role),
    onSuccess: refresh,
    onError: (err) => setError(describe(err)),
  });

  const remove = useMutation({
    mutationFn: (membershipId: string) => removeMember(businessId, membershipId),
    onSuccess: () => {
      setConfirming(null);
      refresh();
    },
    onError: (err) => setError(describe(err)),
  });

  async function copy(invitation: Invitation) {
    try {
      await navigator.clipboard.writeText(inviteUrl(invitation.accept_path));
      setCopied(invitation.id);
      window.setTimeout(() => setCopied(null), 2500);
    } catch {
      // A clipboard the browser won't hand over (an insecure origin, a
      // permission the owner declined) is not an error worth a red panel —
      // the link is on screen and selectable either way.
      setCopied(null);
    }
  }

  const members = teamQuery.data?.members ?? [];
  const invitations = teamQuery.data?.invitations ?? [];

  const roleOptions: { value: AssignableRole; label: string }[] = [
    { value: "staff", label: t("team.role.staff") },
    { value: "manager", label: t("team.role.manager") },
  ];

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      <h1 className="t-h3 text-ink">{t("team.title")}</h1>

      {error && <Notice tone="warn">{error}</Notice>}

      {/* Making the link is the page's one action, so it leads. */}
      <Panel className="p-5 sm:p-6">
        <PanelHeader title={t("team.invite.title")} hint={t("team.invite.body")} />

        <div className="mt-5 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-ink">
              {t("team.invite.roleLabel")}
            </span>
            {/* Full width where a thumb has to hit it, its own width on a
                desk — otherwise the flex column stretches two options across
                the whole panel. */}
            <SegmentedControl
              value={role}
              options={roleOptions}
              onChange={setRole}
              label={t("team.invite.roleLabel")}
              className="w-full sm:w-auto sm:self-start"
            />
            {/* The sentence is the point: "Manager" is a word, this is what
                it actually opens. */}
            <p className="text-sm text-ink-muted">{t(`team.roleBody.${role}`)}</p>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="invite-email" className="text-sm font-semibold text-ink">
              {t("team.invite.emailLabel")}
            </label>
            <input
              id="invite-email"
              type="email"
              inputMode="email"
              autoComplete="off"
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("team.invite.emailPlaceholder")}
              className={cn(fieldClasses, "text-start")}
            />
            <p className="text-sm text-ink-muted">
              {email.trim()
                ? t("team.invite.emailNamed")
                : t("team.invite.emailBlank")}
            </p>
          </div>

          <button
            type="button"
            onClick={() => invite.mutate()}
            disabled={invite.isPending || !businessId}
            className={ctaClasses("primary", "sm", "self-start")}
          >
            <Link2 size={15} aria-hidden />
            {invite.isPending ? t("common.loading") : t("team.invite.cta")}
          </button>
        </div>
      </Panel>

      <Panel className="p-5 sm:p-6">
        <PanelHeader title={t("team.members.title")} />

        {teamQuery.isLoading ? (
          <p className="mt-4 font-mono text-sm text-ink-subtle">
            {t("common.loading")}
          </p>
        ) : (
          <ul className="mt-4 flex flex-col divide-y divide-border">
            {members.map((member) => (
              <MemberRow
                key={member.id ?? "owner"}
                member={member}
                confirming={confirming === member.id}
                busy={remove.isPending || changeRole.isPending}
                onRole={(next) =>
                  changeRole.mutate({ membershipId: member.id!, role: next })
                }
                onConfirm={() => setConfirming(member.id!)}
                onCancel={() => setConfirming(null)}
                onRemove={() => remove.mutate(member.id!)}
              />
            ))}
          </ul>
        )}
      </Panel>

      {invitations.length > 0 && (
        <Panel className="p-5 sm:p-6">
          <PanelHeader
            title={t("team.pending.title")}
            hint={t("team.pending.body")}
          />
          <ul className="mt-4 flex flex-col divide-y divide-border">
            {invitations.map((invitation) => (
              <li
                key={invitation.id}
                className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:gap-4"
              >
                <div className="min-w-0 sm:flex-1">
                  <p className="truncate text-ink" dir="ltr">
                    {invitation.email || t("team.pending.anyone")}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-subtle">
                    {invitation.status === "expired"
                      ? t("team.pending.expired")
                      : t("team.pending.expires", {
                          date: new Date(invitation.expires_at).toLocaleDateString(),
                        })}
                  </p>
                </div>

                <Tag tone="neutral" className="self-start sm:self-auto">
                  {t(`team.role.${invitation.role}`)}
                </Tag>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void copy(invitation)}
                    disabled={invitation.status === "expired"}
                    className={ctaClasses("secondary", "sm")}
                  >
                    {copied === invitation.id ? (
                      <Check size={15} aria-hidden />
                    ) : (
                      <Copy size={15} aria-hidden />
                    )}
                    {copied === invitation.id
                      ? t("common.copied")
                      : t("team.pending.copy")}
                  </button>
                  <IconButton
                    label={t("team.pending.revoke")}
                    onClick={() => revoke.mutate(invitation.id)}
                    disabled={revoke.isPending}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}

function MemberRow({
  member,
  confirming,
  busy,
  onRole,
  onConfirm,
  onCancel,
  onRemove,
}: {
  member: Member;
  confirming: boolean;
  busy: boolean;
  onRole: (role: AssignableRole) => void;
  onConfirm: () => void;
  onCancel: () => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();

  return (
    <li className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:gap-4">
      <p className="min-w-0 truncate text-ink sm:flex-1" dir="ltr">
        {member.email}
      </p>

      {member.is_owner ? (
        // The owner has no Membership row to address, which is exactly what
        // keeps a shop from ending up with nobody in charge.
        <Tag tone="accent" className="self-start sm:self-auto">
          {t("team.role.owner")}
        </Tag>
      ) : (
        <div className="flex items-center gap-2">
          <SegmentedControl
            value={member.role as AssignableRole}
            options={[
              { value: "staff", label: t("team.role.staff") },
              { value: "manager", label: t("team.role.manager") },
            ]}
            onChange={onRole}
            label={t("team.members.roleFor", { email: member.email })}
          />

          {confirming ? (
            <>
              <button
                type="button"
                onClick={onRemove}
                disabled={busy}
                className={ctaClasses("primary", "sm")}
              >
                {t("team.members.confirmRemove")}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className={ctaClasses("secondary", "sm")}
              >
                {t("common.cancel")}
              </button>
            </>
          ) : (
            <IconButton
              label={t("team.members.remove", { email: member.email })}
              onClick={onConfirm}
              disabled={busy}
            />
          )}
        </div>
      )}
    </li>
  );
}

/** A 44px destructive affordance that is an icon on screen and a full
 * sentence to a screen reader. */
function IconButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center rounded-xl text-ink-muted transition-colors hover:bg-ink/[0.06] hover:text-ink disabled:opacity-50",
        focusRing,
      )}
    >
      <Trash2 size={16} aria-hidden />
      <span className="sr-only">{label}</span>
    </button>
  );
}
