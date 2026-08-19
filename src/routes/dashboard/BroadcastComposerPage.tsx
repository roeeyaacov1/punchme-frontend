import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { ctaClasses, focusRing } from "../../components/marketing/primitives";
import { Notice, Panel } from "../../components/dashboard/primitives";
import { MessageForm, type MessageDraft } from "../../components/messaging/MessageForm";
import { formatWhen, messagingErrorMessage } from "../../components/messaging/describe";
import { useBusiness } from "../../business/useBusiness";
import { listTemplates } from "../../api/businesses";
import {
  createBroadcast,
  getAudienceCount,
  getMessagingSummary,
  listRecipes,
  sendTestMessage,
} from "../../api/messaging";
import { useDebounce } from "../../hooks/useDebounce";
import { cn } from "../../lib/cn";
import { useCardLanguage } from "../../hooks/useCardLanguage";

/**
 * One message to everyone, now. WHAT + GIFT + WHO, then a two-step send:
 * the button says how many people it reaches, and the confirmation repeats
 * it and says it can't be undone — an inline panel in the owner's language,
 * not the browser's confirm box.
 */
export function BroadcastComposerPage() {
  const { t, i18n } = useTranslation();
  const { business } = useBusiness();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const businessId = business?.id ?? undefined;
  const lang = i18n.resolvedLanguage ?? "he";

  const [draft, setDraft] = useState<MessageDraft>({
    title: "",
    body: "",
    gift_stamps: 0,
    gift_complete_card: false,
    opt_in_only: false,
    template_id: null,
  });
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tested, setTested] = useState(false);
  const seeded = useRef(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const { data: templates } = useQuery({
    queryKey: ["templates", businessId],
    queryFn: () => listTemplates(businessId!),
    enabled: !!businessId,
  });
  const template = templates?.[0];
  const language = useCardLanguage(businessId, template?.id ?? undefined);
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
  const canSend = summary.data?.can_send ?? false;

  // The broadcast recipe only offers a title; the body is the owner's.
  useEffect(() => {
    const recipe = recipes.data?.find((r) => r.kind === "broadcast");
    if (recipe && !seeded.current) {
      seeded.current = true;
      setDraft((d) => (d.title ? d : { ...d, title: recipe.title }));
    }
  }, [recipes.data]);

  function update(patch: Partial<MessageDraft>) {
    setDraft((d) => ({ ...d, ...patch }));
    setError(null);
    setTested(false);
    setConfirming(false);
  }

  const debounced = useDebounce(draft, 350);
  const audience = useQuery({
    queryKey: ["messaging", "audience", businessId, "broadcast", debounced.opt_in_only, debounced.template_id],
    queryFn: () =>
      getAudienceCount(businessId!, {
        kind: "broadcast",
        opt_in_only: debounced.opt_in_only,
        template_id: debounced.template_id ?? undefined,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["broadcasts", businessId] });
      queryClient.invalidateQueries({ queryKey: ["messaging", "summary", businessId] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
      navigate("/dashboard/messages", { state: { flash: t("messaging.broadcast.sent") } });
    },
    onError: (e) => {
      setConfirming(false);
      setError(messagingErrorMessage(e, t, lang));
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
      setTested(true);
      queryClient.invalidateQueries({ queryKey: ["activity"] });
    },
    onError: (e) => setError(messagingErrorMessage(e, t, lang)),
  });

  const busy = send.isPending || test.isPending;
  const ready = draft.body.trim().length > 0;
  const left = summary.data
    ? Math.max(0, summary.data.broadcasts_limit_7d - summary.data.broadcasts_used_7d)
    : null;
  const blocked = !!summary.data?.next_broadcast_allowed_at;

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      <div>
        <Link
          to="/dashboard/messages"
          className={cn(
            "inline-flex min-h-[44px] items-center gap-1 text-sm font-semibold text-ink-muted hover:text-ink",
            focusRing,
          )}
        >
          <ArrowLeft size={15} aria-hidden className="rtl:-scale-x-100" />
          {t("messaging.editor.back")}
        </Link>
        <h1 className="t-h3 text-ink">{t("messaging.broadcast.composerTitle")}</h1>
        <p className="mt-1 text-sm text-ink-muted">{t("messaging.broadcast.composerLead")}</p>
      </div>

      {summary.data && !canSend && (
        <Notice tone="warn">
          {summary.data.is_pro ? t("messaging.guard.notEnabled") : t("messaging.guard.pro")}{" "}
          {!summary.data.is_pro && (
            <Link
              to="/dashboard/billing"
              className={cn("font-semibold underline hover:no-underline", focusRing)}
            >
              {t("messaging.guard.proLink")}
            </Link>
          )}
        </Notice>
      )}
      {summary.data && canSend && blocked && (
        <Notice tone="warn">
          {t("messaging.broadcast.quota", {
            max: summary.data.broadcasts_limit_7d,
            next: t("messaging.broadcast.nextAllowed", {
              when: formatWhen(summary.data.next_broadcast_allowed_at, lang),
            }),
          })}
        </Notice>
      )}

      <Panel className="p-5 sm:p-6">
        <MessageForm
          value={draft}
          onChange={update}
          kind="broadcast"
          language={language}
          businessName={business?.name ?? ""}
          rewardText={template?.reward_description ?? ""}
          cardColors={{
            background: template?.background_color,
            foreground: template?.foreground_color,
          }}
          templates={templates?.map((tpl) => ({ id: tpl.id!, name: tpl.name }))}
          audience={{ count, loading: audience.isFetching && !audience.data }}
          disabled={busy}
          bodyRef={bodyRef}
        />
      </Panel>

      <Panel className="flex flex-col gap-4 p-5 sm:p-6">
        {error && <Notice tone="danger">{error}</Notice>}
        {tested && <Notice tone="ok">{t("messaging.editor.tested")}</Notice>}

        {confirming ? (
          <div className="flex flex-col gap-3 rounded-xl border border-border-strong bg-background p-4">
            <p className="font-semibold text-ink">{t("messaging.broadcast.confirmTitle")}</p>
            <p className="text-sm text-ink-muted">
              {t("messaging.broadcast.confirmBody", { count: count ?? 0 })}{" "}
              {/* unreachable with count==null — the send button is disabled */}
              {left !== null && t("messaging.broadcast.left", { count: Math.max(0, left - 1) })}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={() => send.mutate()}
                className={ctaClasses("primary", "sm")}
              >
                <Send size={15} aria-hidden className="rtl:-scale-x-100" />
                {t("messaging.broadcast.confirmYes")}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => setConfirming(false)}
                className={ctaClasses("secondary", "sm")}
              >
                {t("messaging.editor.cancel")}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={!ready || busy || !canSend || blocked || count === null || count === 0}
              onClick={() => setConfirming(true)}
              className={ctaClasses("primary", "sm")}
            >
              <Send size={15} aria-hidden className="rtl:-scale-x-100" />
              {count === null
                ? t("common.loading")
                : count === 0
                  ? t("messaging.broadcast.sendZero")
                  : t("messaging.broadcast.send", { count })}
            </button>
            <button
              type="button"
              disabled={!ready || busy}
              onClick={() => test.mutate()}
              className={ctaClasses("secondary", "sm")}
            >
              {t("messaging.editor.test")}
            </button>
          </div>
        )}
      </Panel>
    </div>
  );
}
