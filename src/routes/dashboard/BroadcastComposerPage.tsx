import { useEffect, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CircleAlert, CircleCheck, Send } from "lucide-react";
import { Button, Dialog, LinkButton, Notice, Skeleton } from "../../components/kit";
import { ReadProblem } from "../../components/dashboard/ReadProblem";
import { usePageTitle } from "../../components/dashboard/shell/pageTitle";
import { PUNCHME_MONTHLY_PRICE } from "../../components/marketing/calculator";
import { MessageFields } from "../../components/messaging/MessageFields";
import { MessageStage } from "../../components/messaging/MessageStage";
import { messagingErrorMessage, relativeWhen } from "../../components/messaging/describe";
import {
  EMPTY_MESSAGE,
  hasGift,
  messageReady,
  previewOf,
  type MessageDraft,
} from "../../components/messaging/messageDraft";
import { dropDraft, readDraft, writeDraft } from "../../components/messaging/sessionDraft";
import { useBusiness } from "../../business/useBusiness";
import { isOwner } from "../../business/gating";
import { listTemplates } from "../../api/businesses";
import { getTemplateDesign } from "../../api/designs";
import { ApiError } from "../../api/errors";
import {
  createBroadcast,
  getAudienceCount,
  getMessagingSummary,
  listRecipes,
  sendTestMessage,
} from "../../api/messaging";
import { useCardLanguage } from "../../hooks/useCardLanguage";
import { useDebounce } from "../../hooks/useDebounce";
import { useLightboxPage } from "../../theme/lightboxPage";
import { formatCount } from "./format";
import { problemKey } from "./problem";


/** A number inside a sentence, in tabular figures with its own direction. */
const figure = <span dir="ltr" className="type-figure" />;

/**
 * One message to everyone, now. The fields, then the message as it lands
 * and who gets it in one sentence, then the send: its button says how many
 * it reaches, and a dialog repeats the count, says it can't be undone and
 * what's left of the week, opening on Cancel.
 *
 * The draft is kept in the tab while the owner steps away. On a phone the
 * send is docked above the phone bar; from 1024px the message, the sentence
 * and the send hold still beside the fields. Free draws no send at all, a
 * dead button being worse than none: the sample to the shop's own card is
 * the action there.
 */
export function BroadcastComposerPage() {
  useLightboxPage();
  const { t, i18n } = useTranslation();
  // Titled as its heading is, not by the list it was opened from.
  usePageTitle(t("messaging.broadcast.composerTitle"));
  const lang = i18n.resolvedLanguage ?? "he";
  const { business, role, isPro } = useBusiness();
  const owns = isOwner(role);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const businessId = business?.id ?? undefined;
  const businessName = business?.name ?? "";

  // Kept per business, so another account signing in on this tab never
  // finds someone else's words.
  const draftKey = `${businessId}/messages/new`;
  const [restored] = useState(() => (businessId ? readDraft<MessageDraft>(draftKey) : null));
  const [draft, setDraft] = useState<MessageDraft>(() => restored ?? EMPTY_MESSAGE);
  const [touched, setTouched] = useState(!!restored);
  const [confirming, setConfirming] = useState(false);
  const [sendProblem, setSendProblem] = useState<unknown>(null);
  const [sample, setSample] = useState<"idle" | "sent" | { error: unknown }>("idle");
  const problemRef = useRef<HTMLParagraphElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleInput = useRef<HTMLInputElement>(null);
  const seeded = useRef(!!restored);

  const templates = useQuery({
    queryKey: ["templates", businessId],
    queryFn: () => listTemplates(businessId!),
    enabled: !!businessId,
  });
  const template = templates.data?.[0];
  const templateId = template?.id ?? undefined;
  const language = useCardLanguage(businessId, templateId);
  const design = useQuery({
    queryKey: ["design", templateId],
    queryFn: () => getTemplateDesign(businessId!, templateId!),
    enabled: !!businessId && !!templateId,
    staleTime: 60_000,
  });
  const recipes = useQuery({
    queryKey: ["recipes", businessId, language],
    queryFn: () => listRecipes(businessId!, language),
    enabled: !!businessId,
    staleTime: Infinity,
  });
  const summary = useQuery({
    queryKey: ["messaging", "summary", businessId],
    queryFn: () => getMessagingSummary(businessId!),
    enabled: !!businessId,
    staleTime: 10_000,
  });

  // The broadcast starter offers only a title; the body is the owner's.
  useEffect(() => {
    const recipe = recipes.data?.find((r) => r.kind === "broadcast");
    if (recipe && !seeded.current) {
      seeded.current = true;
      setDraft((current) => (current.title ? current : { ...current, title: recipe.title }));
    }
  }, [recipes.data]);

  // Kept while it is being written; the seeded title alone isn't a draft.
  useEffect(() => {
    if (touched && businessId) writeDraft(draftKey, draft);
  }, [draft, touched, draftKey, businessId]);

  function update(patch: Partial<MessageDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
    setTouched(true);
    setSendProblem(null);
    setSample("idle");
  }

  function discard() {
    dropDraft(draftKey);
    setTouched(false);
    // Back to the start, with the starter's title seeded again, and focus
    // where writing starts: the button that did it is gone.
    const recipe = recipes.data?.find((r) => r.kind === "broadcast");
    seeded.current = !!recipe;
    setDraft(recipe ? { ...EMPTY_MESSAGE, title: recipe.title } : EMPTY_MESSAGE);
    setSendProblem(null);
    setSample("idle");
    titleInput.current?.focus();
  }

  const audienceOptions = useDebounce({ opt_in_only: draft.opt_in_only, template_id: draft.template_id }, 350);
  const audience = useQuery({
    queryKey: ["messaging", "audience", businessId, "broadcast", audienceOptions.opt_in_only, audienceOptions.template_id],
    queryFn: () =>
      getAudienceCount(businessId!, {
        kind: "broadcast",
        opt_in_only: audienceOptions.opt_in_only,
        template_id: audienceOptions.template_id ?? undefined,
      }),
    enabled: !!businessId,
    staleTime: 10_000,
  });
  const count = audience.data?.count ?? null;

  const send = useMutation({
    mutationFn: () =>
      createBroadcast(businessId!, {
        title: draft.title.trim(),
        body: draft.body.trim(),
        gift_stamps: draft.gift_stamps,
        gift_complete_card: draft.gift_complete_card,
        opt_in_only: draft.opt_in_only,
        template_id: draft.template_id,
      }),
    onSuccess: (created) => {
      dropDraft(draftKey);
      void queryClient.invalidateQueries({ queryKey: ["broadcasts", businessId] });
      void queryClient.invalidateQueries({ queryKey: ["messaging", "summary", businessId] });
      void queryClient.invalidateQueries({ queryKey: ["customers"] });
      void queryClient.invalidateQueries({ queryKey: ["activity"] });
      // Sent lights the row this broadcast lands in.
      navigate("/dashboard/messages?tab=sent", { state: { flash: t("messaging.broadcast.sent"), arrived: created.id } });
    },
    onError: (error) => {
      setSendProblem(error);
      setConfirming(false);
      // The week's quota moved, or was already spent elsewhere.
      if (error instanceof ApiError && error.code === "messaging_quota") {
        void queryClient.invalidateQueries({ queryKey: ["messaging", "summary", businessId] });
      }
    },
  });

  const test = useMutation({
    mutationFn: () =>
      sendTestMessage(businessId!, {
        kind: "broadcast",
        title: draft.title.trim(),
        body: draft.body.trim(),
        gift_stamps: draft.gift_stamps,
        gift_complete_card: draft.gift_complete_card,
        template_id: draft.template_id,
      }),
    onSuccess: () => {
      setSample("sent");
      void queryClient.invalidateQueries({ queryKey: ["activity"] });
    },
    onError: (error) => setSample({ error }),
  });

  const words = (error: unknown) =>
    error instanceof ApiError && error.code ? messagingErrorMessage(error, t, lang) : t(problemKey(error));

  const facts = summary.data;
  const open = isPro && (facts?.can_send ?? false);
  const left = facts ? Math.max(0, facts.broadcasts_limit_7d - facts.broadcasts_used_7d) : null;
  const quotaRefused = sendProblem instanceof ApiError && sendProblem.code === "messaging_quota";
  const spent = !!facts?.next_broadcast_allowed_at || left === 0 || quotaRefused;
  const ready = messageReady(draft, "broadcast");
  const nobody = count === 0;
  const canSend = open && !spent && ready && count !== null && count > 0;

  const quota = !facts
    ? null
    : facts.next_broadcast_allowed_at
      ? t("messaging.broadcast.nextAllowed", { when: relativeWhen(facts.next_broadcast_allowed_at, t, lang) })
      : left === 0
        ? t("messaging.broadcast.leftNone")
        : t("messaging.broadcast.left", { count: left ?? 0 });

  const preview = previewOf(draft, {
    kind: "broadcast",
    language,
    businessName,
    rewardText: template?.reward_description ?? "",
  });

  const notice = !isPro ? (
    <Notice
      tone="warn"
      action={
        owns ? (
          <LinkButton to="/dashboard/billing" variant="primary" className="max-w-full !whitespace-normal text-center">
            {t("billing.activateCta")}
          </LinkButton>
        ) : undefined
      }
    >
      {owns ? (
        <Trans
          i18nKey="messaging.free.owner"
          values={{ price: PUNCHME_MONTHLY_PRICE }}
          components={{ ltr: <bdi dir="ltr" className="type-figure" /> }}
        />
      ) : (
        t("messaging.free.hire")
      )}
    </Notice>
  ) : facts && !facts.can_send ? (
    <Notice tone="warn">{t("messaging.guard.notEnabled")}</Notice>
  ) : facts?.dispatch_enabled === false ? (
    <Notice tone="warn">{t("messaging.guard.dispatchOff")}</Notice>
  ) : null;

  // Who gets it and when, in one sentence, said again whenever the count
  // the 350ms query brings back changes.
  let sentence = null;
  if (count === null) sentence = <Skeleton className="h-5 w-4/5" />;
  else if (nobody) {
    sentence = t(draft.opt_in_only ? "messaging.broadcast.nobodyOptedIn" : "messaging.broadcast.nobody");
  } else {
    const gift = !hasGift(draft)
      ? null
      : draft.gift_complete_card
        ? t("messaging.broadcast.giftCards", { count, value: formatCount(count, lang) })
        : t("messaging.broadcast.giftStamps", {
            count: count * draft.gift_stamps,
            value: formatCount(count * draft.gift_stamps, lang),
          });
    sentence = (
      <>
        <Trans
          i18nKey="messaging.broadcast.goesTo"
          count={count}
          values={{ value: formatCount(count, lang) }}
          components={{ n: figure }}
        />
        {draft.opt_in_only && <> {t("messaging.sentence.optIn")}</>}
        {gift && <> {gift}</>}
      </>
    );
  }

  const weekAfter = left === null ? null : left - 1 <= 0 ? t("messaging.broadcast.lastOne") : t("messaging.broadcast.leftAfter", { count: left - 1 });

  const sendButton = isPro && (
    <Button
      size="lg"
      icon={<Send aria-hidden className="rtl:-scale-x-100" />}
      disabled={!canSend}
      aria-describedby={spent && open ? "composer-quota" : undefined}
      onClick={() => setConfirming(true)}
      className="w-full max-w-full !whitespace-normal text-center"
    >
      {count !== null && count > 0
        ? t("messaging.broadcast.send", { count, value: formatCount(count, lang) })
        : t("messaging.broadcast.sendPlain")}
    </Button>
  );

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <header className="flex flex-col items-start gap-1">
        <LinkButton
          to="/dashboard/messages?tab=broadcast"
          variant="quiet"
          icon={<ArrowLeft aria-hidden className="rtl:-scale-x-100" />}
          className="-ms-3 max-w-full !whitespace-normal text-center"
        >
          {t("messaging.editor.back")}
        </LinkButton>
        <h1 className="type-title text-ink">{t("messaging.broadcast.composerTitle")}</h1>
        {open && quota && (
          <p id="composer-quota" className="type-body text-ink-muted">
            {quota}
          </p>
        )}
      </header>

      {isPro && !facts && (summary.isError || summary.fetchStatus === "paused") ? (
        <ReadProblem
          title={t("messaging.loadFailed.figures")}
          error={summary.error}
          paused={!summary.isError}
          onRetry={() => void summary.refetch()}
        />
      ) : (
        notice
      )}

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-8">
        <div className="flex min-w-0 flex-col gap-5">
          <MessageFields
            value={draft}
            onChange={update}
            kind="broadcast"
            language={language}
            rewardText={template?.reward_description ?? ""}
            templates={templates.data?.map((tpl) => ({ id: tpl.id!, name: tpl.name }))}
            optInAvailable={facts?.can_reach_one_customer ?? true}
            disabled={send.isPending}
            titleInputRef={titleInput}
          />
          {touched && (
            <Button variant="quiet" onClick={discard} className="-ms-3 self-start max-w-full !whitespace-normal text-center">
              {t("messaging.editor.discard")}
            </Button>
          )}
        </div>

        <aside className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-8">
          {template && design.data ? (
            <div className="-mx-4 flex justify-center sm:mx-0">
              <MessageStage
                businessName={businessName}
                template={template}
                design={design.data}
                notification={preview}
                summary={t("messaging.sheet.stageSummary")}
              />
            </div>
          ) : (
            <Skeleton className="mx-auto h-[28rem] w-[340px] max-w-full rounded-glass" />
          )}

          <div className="flex flex-col gap-2">
            {/* On Free the notice above already says who it reaches: nobody yet. */}
            {isPro && (
              <p role="status" className="type-body text-ink">
                {sentence}
              </p>
            )}
            <p className="text-sm leading-snug text-ink-muted">{t("messaging.phones")}</p>
          </div>

          {sendProblem !== null && (
            <p
              ref={problemRef}
              tabIndex={-1}
              role="alert"
              className="flex items-start gap-1.5 text-sm font-semibold leading-snug text-danger outline-none"
            >
              <CircleAlert aria-hidden className="mt-px size-4 shrink-0" />
              <span>{words(sendProblem)}</span>
            </p>
          )}

          {/* On a phone the send waits above the phone bar, always in
              reach; its own padding runs under the raised Scan button. */}
          {sendButton && (
            <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20 border-t border-border bg-surface px-4 pb-7 pt-3 md:static md:z-auto md:border-0 md:bg-transparent md:p-0">
              {sendButton}
            </div>
          )}

          <div className="flex flex-col items-start gap-2">
            <Button
              variant="secondary"
              busy={test.isPending}
              disabled={!ready || send.isPending}
              onClick={() => test.mutate()}
              className="max-w-full !whitespace-normal text-center"
            >
              {t("messaging.editor.test")}
            </Button>
            <p role="status" className="text-sm leading-snug">
              {sample === "sent" ? (
                <span className="flex items-start gap-1.5 text-ink">
                  <CircleCheck aria-hidden className="mt-px size-4 shrink-0 text-ok" />
                  <span>{t("messaging.editor.tested")}</span>
                </span>
              ) : sample !== "idle" ? (
                <span className="flex items-start gap-1.5 font-semibold text-danger">
                  <CircleAlert aria-hidden className="mt-px size-4 shrink-0" />
                  <span>{words(sample.error)}</span>
                </span>
              ) : null}
            </p>
          </div>
          {/* Room under the docked send, so the page's foot scrolls clear of it. */}
          {sendButton && <div aria-hidden className="h-24 md:hidden" />}
        </aside>
      </div>

      <Dialog
        open={confirming}
        onClose={() => setConfirming(false)}
        title={t("messaging.broadcast.confirmTitle")}
        initialFocus={cancelRef}
        returnFocus={problemRef}
        footer={
          <>
            <Button ref={cancelRef} variant="secondary" onClick={() => setConfirming(false)} className="max-w-full !whitespace-normal text-center">
              {t("messaging.editor.cancel")}
            </Button>
            <Button busy={send.isPending} icon={<Send aria-hidden className="rtl:-scale-x-100" />} onClick={() => send.mutate()} className="max-w-full !whitespace-normal text-center">
              {t("messaging.broadcast.confirmYes")}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <div className="rounded-field border border-border bg-background p-3">
            {preview.title && (
              <p dir="auto" className="type-body font-semibold text-ink [text-align:-webkit-match-parent] [text-align:match-parent]">
                {preview.title}
              </p>
            )}
            <p dir="auto" className="type-body line-clamp-3 text-ink-muted [text-align:-webkit-match-parent] [text-align:match-parent]">
              {preview.body}
            </p>
          </div>
          <p className="type-body text-ink">
            {t("messaging.broadcast.confirmBody", { count: count ?? 0, value: formatCount(count ?? 0, lang) })}
          </p>
          {weekAfter && <p className="type-body text-ink-muted">{weekAfter}</p>}
        </div>
      </Dialog>
    </div>
  );
}
