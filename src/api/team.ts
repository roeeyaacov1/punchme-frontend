import { api } from "./client";
import type { components } from "./generated/schema";

export type Team = components["schemas"]["TeamOut"];
export type Member = components["schemas"]["MemberOut"];
export type Invitation = components["schemas"]["InvitationOut"];
export type InvitationPreview = components["schemas"]["InvitationPreviewOut"];

/** Ranked, and only two of the three can be handed out — ownership is
 * transferred, never granted. Kept in step with `businesses.models.Role`. */
export type Role = "owner" | "manager" | "staff";
export const ASSIGNABLE_ROLES = ["manager", "staff"] as const;
export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

export function getTeam(businessId: string) {
  return api.get<Team>(`/api/businesses/${businessId}/team`);
}

export function createInvitation(
  businessId: string,
  input: { role: AssignableRole; email?: string },
) {
  return api.post<Invitation>(`/api/businesses/${businessId}/team/invitations`, {
    role: input.role,
    email: input.email ?? "",
  });
}

export function revokeInvitation(businessId: string, invitationId: string) {
  return api.delete<void>(
    `/api/businesses/${businessId}/team/invitations/${invitationId}`,
  );
}

export function changeMemberRole(
  businessId: string,
  membershipId: string,
  role: AssignableRole,
) {
  return api.patch<Member>(
    `/api/businesses/${businessId}/team/members/${membershipId}`,
    { role },
  );
}

export function removeMember(businessId: string, membershipId: string) {
  return api.delete<void>(
    `/api/businesses/${businessId}/team/members/${membershipId}`,
  );
}

/** Public — the invitee opens this from a chat message, before they have an
 * account. `auth: false` matters: a stale token from a previous session
 * would otherwise be attached and refreshed for a page that needs neither. */
export function getInvitationPreview(token: string) {
  return api.get<InvitationPreview>(`/api/invitations/${token}`, { auth: false });
}

export function acceptInvitation(token: string) {
  return api.post<Member>(`/api/invitations/${token}/accept`);
}

/** The link the owner copies. The API returns a path, not a URL — it has no
 * business knowing which origin the dashboard is served from — so the origin
 * is joined here, where it is by definition the one the owner is looking at. */
export function inviteUrl(acceptPath: string): string {
  return `${window.location.origin}${acceptPath}`;
}
