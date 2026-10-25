import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getTeam, type Invitation, type Member, type Team } from "../../api/team";
import { useBusiness } from "../../business/useBusiness";
import { ReadProblem } from "../../components/dashboard/ReadProblem";
import { Badge, List, ListRow, LitPanel, SkeletonRows, useToast } from "../../components/kit";
import { useLightboxPage } from "../../theme/lightboxPage";
import { listDay } from "./format";
import { isolate } from "./problem";
import { Email } from "./team/Email";
import { InvitationSheet } from "./team/InvitationSheet";
import { InvitePanel } from "./team/InvitePanel";
import { MemberSheet } from "./team/MemberSheet";
import { joinedSince } from "./team/teamFacts";
import { lastTeamVisit, rememberTeamVisit } from "./team/teamSeen";

/**
 * Who else can work here.
 *
 * The owner's mental model is a shop, not an access-control matrix, so the
 * page is written as one: the invitation leads and turns into the link
 * where it was made, then a row per person and a row per open link. There
 * is no email delivery in this product; the owner sends the link the way
 * they already talk to the person they just hired, and the lead says so
 * before anything else.
 *
 * From 1024px the invitation stands on the start side and the lists beside
 * it, so the form never pushes the team down. A read that fails says so in
 * place of both lists, never as a team of nobody: an open link nobody can
 * see is one nobody can cancel. And a hire who joined since the owner last
 * looked is marked "New" until the page has been seen, so a link sent last
 * week comes back as a person rather than as a row that disappeared.
 */
export function TeamPage() {
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const { business } = useBusiness();
  useLightboxPage();
  const toast = useToast();
  const queryClient = useQueryClient();
  const businessId = business?.id ?? "";
  const businessName = business?.name ?? "";

  const teamKey = ["team", businessId];
  const team = useQuery({
    queryKey: teamKey,
    queryFn: () => getTeam(businessId),
    enabled: !!businessId,
  });

  // The visit before this one, read once as the page opens; this one is
  // kept each time the team is shown.
  const [since] = useState(() => lastTeamVisit(businessId));
  useEffect(() => {
    if (team.isSuccess) rememberTeamVisit(businessId, team.dataUpdatedAt);
  }, [team.isSuccess, team.dataUpdatedAt, businessId]);
  const fresh = useMemo(() => joinedSince(team.data?.members ?? [], since), [team.data, since]);

  const membersHeading = useRef<HTMLHeadingElement>(null);
  const pendingHeading = useRef<HTMLHeadingElement>(null);
  // The open invitations' heading while there are any, the team's once
  // the last one has gone.
  const listHeading = useMemo<RefObject<HTMLElement>>(
    () => ({
      get current() {
        return pendingHeading.current ?? membersHeading.current;
      },
    }),
    [],
  );

  const [member, setMember] = useState<Member | null>(null);
  const [memberOpen, setMemberOpen] = useState(false);
  const [memberRemoved, setMemberRemoved] = useState(false);
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [invitationOpen, setInvitationOpen] = useState(false);

  // Where focus goes once a sheet has closed, read as its exit ends so it
  // answers for the page as it then is: a target the page named once a row
  // went by the owner's own hand, else the row that opened the sheet while
  // it is still there, else its list's heading. A row can also go in a
  // background read while its sheet is open (the hire accepts, someone is
  // removed on another device), and focus must not fall to <body>.
  const opener = useRef<HTMLElement | null>(null);
  const named = useRef<RefObject<HTMLElement> | null>(null);
  const memberReturn = useMemo<RefObject<HTMLElement>>(
    () => ({
      get current() {
        if (named.current) return named.current.current;
        return opener.current?.isConnected ? opener.current : membersHeading.current;
      },
    }),
    [],
  );
  const invitationReturn = useMemo<RefObject<HTMLElement>>(
    () => ({
      get current() {
        if (named.current) return named.current.current;
        return opener.current?.isConnected ? opener.current : listHeading.current;
      },
    }),
    [listHeading],
  );

  function rememberOpener() {
    const active = document.activeElement;
    opener.current = active instanceof HTMLElement && active !== document.body ? active : null;
    named.current = null;
  }

  /** The change at once, so focus has its target the moment a sheet closes,
   * and then the team as the server has it. */
  function patchTeam(change: (current: Team) => Team) {
    queryClient.setQueryData<Team>(teamKey, (old) => (old ? change(old) : old));
    void queryClient.invalidateQueries({ queryKey: teamKey });
  }

  function readAgain(target: RefObject<HTMLElement>) {
    named.current = target;
    void queryClient.invalidateQueries({ queryKey: teamKey });
  }

  function openMember(person: Member) {
    rememberOpener();
    setMember(person);
    setMemberRemoved(false);
    setMemberOpen(true);
  }

  function openInvitation(one: Invitation) {
    rememberOpener();
    setInvitation(one);
    setInvitationOpen(true);
  }

  const members = team.data?.members ?? [];
  const owner = members.find((person) => person.is_owner);
  const hires = members.filter((person) => !person.is_owner);
  const invitations = team.data?.invitations ?? [];

  const membersTitle = (
    <h2 id="team-members-title" ref={membersHeading} tabIndex={-1} className="type-card-title text-ink outline-none">
      {t("team.members.title")}
    </h2>
  );

  let lists: ReactNode;
  if (!team.data && (team.isError || team.fetchStatus === "paused")) {
    lists = (
      <ReadProblem
        title={t("team.loadFailed")}
        error={team.error}
        paused={!team.isError}
        onRetry={() => void team.refetch()}
      />
    );
  } else if (!team.data) {
    lists = (
      <section aria-labelledby="team-members-title" className="flex flex-col gap-3">
        {membersTitle}
        <LitPanel className="overflow-hidden">
          <SkeletonRows rows={3} />
        </LitPanel>
      </section>
    );
  } else {
    lists = (
      <>
        <section aria-labelledby="team-members-title" className="flex flex-col gap-3">
          {membersTitle}
          <LitPanel className="overflow-hidden">
            <List>
              {/* No sheet behind the owner's row: the owner isn't a
                  membership, which is what keeps a shop from ending up
                  with nobody in charge. */}
              {owner && <ListRow title={<Email value={owner.email} />} meta={t("team.members.owner")} />}
              {hires.map((person) => (
                <ListRow
                  key={person.id}
                  title={<Email value={person.email} />}
                  meta={t("team.members.meta", {
                    role: t(`team.role.${person.role}`),
                    date: listDay(person.joined_at, language),
                  })}
                  trailing={person.id && fresh.has(person.id) ? <Badge>{t("team.member.new")}</Badge> : undefined}
                  chevron
                  onClick={() => openMember(person)}
                />
              ))}
            </List>
          </LitPanel>
        </section>

        {invitations.length > 0 && (
          <section aria-labelledby="team-pending-title" className="flex flex-col gap-3">
            <h2 id="team-pending-title" ref={pendingHeading} tabIndex={-1} className="type-card-title text-ink outline-none">
              {t("team.pending.title")}
            </h2>
            <LitPanel className="overflow-hidden">
              <List>
                {invitations.map((one) => (
                  <ListRow
                    key={one.id}
                    title={one.email ? <Email value={one.email} /> : t("team.pending.anyone")}
                    meta={t(one.status === "expired" ? "team.pending.expired" : "team.pending.until", {
                      role: t(`team.role.${one.role}`),
                      date: listDay(one.expires_at, language),
                    })}
                    chevron
                    onClick={() => openInvitation(one)}
                  />
                ))}
              </List>
            </LitPanel>
          </section>
        )}
      </>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="type-title text-ink">{t("team.title")}</h1>
        <p className="type-body max-w-prose text-ink-muted">{t("team.lead")}</p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,23rem)_minmax(0,1fr)]">
        {/* Making a link needs no list, so the form works while the team
            is still loading, or after it failed to. */}
        <InvitePanel
          businessId={businessId}
          businessName={businessName}
          team={team.data}
          onMade={(created) =>
            patchTeam((current) => ({
              ...current,
              // Inviting an address again cancels its earlier link.
              invitations: [
                created,
                ...current.invitations.filter((one) => !created.email || one.email !== created.email),
              ],
            }))
          }
        />
        <div className="flex min-w-0 flex-col gap-6">{lists}</div>
      </div>

      <MemberSheet
        businessId={businessId}
        businessName={businessName}
        member={member}
        open={memberOpen}
        onClose={() => setMemberOpen(false)}
        returnFocus={memberReturn}
        removed={memberRemoved}
        onSaved={(updated) => {
          patchTeam((current) => ({
            ...current,
            members: current.members.map((person) => (person.id === updated.id ? updated : person)),
          }));
          toast.show({
            tone: "ok",
            title: t("team.member.saved", { email: isolate(updated.email), role: t(`team.role.${updated.role}`) }),
          });
          setMemberOpen(false);
        }}
        onRemoved={(person) => {
          patchTeam((current) => ({
            ...current,
            members: current.members.filter((one) => one.id !== person.id),
          }));
          toast.show({ tone: "ok", title: t("team.member.removed", { email: isolate(person.email) }) });
          named.current = membersHeading;
          setMemberRemoved(true);
          setMemberOpen(false);
        }}
        onGone={() => readAgain(membersHeading)}
      />

      <InvitationSheet
        businessId={businessId}
        businessName={businessName}
        team={team.data}
        invitation={invitation}
        open={invitationOpen}
        onClose={() => setInvitationOpen(false)}
        returnFocus={invitationReturn}
        onCancelled={(which) => {
          patchTeam((current) => ({
            ...current,
            invitations: current.invitations.filter((one) => one.id !== which.id),
          }));
          toast.show({
            tone: "ok",
            title: t(which.status === "expired" ? "team.invitation.removed" : "team.invitation.cancelled"),
          });
          named.current = listHeading;
          setInvitationOpen(false);
        }}
        onRenewed={(old, created) => {
          patchTeam((current) => ({
            ...current,
            invitations: [
              created,
              ...current.invitations.filter(
                (one) => one.id !== old.id && (!created.email || one.email !== created.email),
              ),
            ],
          }));
          // The row that opened the sheet is the old link's, now gone.
          named.current = listHeading;
        }}
        onGone={() => readAgain(listHeading)}
      />
    </div>
  );
}
