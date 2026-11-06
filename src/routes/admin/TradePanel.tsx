import type { Ref } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Info, Plus } from "lucide-react";
import { Badge, LinkButton, LitPanel } from "../../components/kit";
import { LookRow } from "./LookRow";
import type { RowNote } from "./rows";
import type { ShelfRow, TradeShelf, TradeStatus } from "./shelf";

/** What a trade's head says owners get: how many looks, its classic one, or nothing. */
export function TradeStatusLine({ status }: { status: TradeStatus }) {
  const { t } = useTranslation();
  // A tag that may wrap: with large text it is wider than a phone's panel.
  if (status.kind === "hidden") {
    return (
      <Badge tone="warn" className="!whitespace-normal">
        {t("admin.catalog.hidden")}
      </Badge>
    );
  }
  if (status.kind === "classic") return <span className="text-sm text-ink-muted">{t("admin.catalog.classic")}</span>;
  return (
    <span className="text-sm text-ink-muted">
      {/* The figure in Rubik's tabular digits, in a direction of its own. */}
      <Trans
        i18nKey="admin.catalog.count"
        count={status.n}
        components={{ n: <span dir="ltr" className="font-heading font-medium tabular-nums text-ink" /> }}
      />
    </span>
  );
}

export interface RowState {
  note: RowNote | null;
  litKey: number | null;
  litAfterModal: boolean;
}

/**
 * One trade as owners meet it (the brief's §7.4): its name and what owners
 * get, its looks numbered in the order the wizard offers them, then its
 * other looks under "Not in the wizard", each saying why, and at its foot a
 * new look that starts in this trade.
 */
export function TradePanel({
  trade,
  headingRef,
  rowState,
  gone,
  busy,
  onActions,
  onPublishAgain,
  actionsRef,
  againRef,
}: {
  trade: TradeShelf;
  headingRef: Ref<HTMLHeadingElement>;
  rowState: (row: ShelfRow) => RowState;
  /** A look of this trade that was gone when it was written to, said here
   * since its row is gone too. */
  gone: string | null;
  busy: boolean;
  onActions: (row: ShelfRow) => void;
  onPublishAgain: (row: ShelfRow) => void;
  actionsRef: (key: string) => (element: HTMLButtonElement | null) => void;
  againRef: (key: string) => (element: HTMLButtonElement | null) => void;
}) {
  const { t } = useTranslation();
  const headingId = `trade-${trade.niche}`;
  const row = (look: ShelfRow) => {
    const state = rowState(look);
    return (
      <LookRow
        key={look.key}
        row={look}
        note={state.note}
        litKey={state.litKey}
        litAfterModal={state.litAfterModal}
        busy={busy}
        onActions={() => onActions(look)}
        onPublishAgain={() => onPublishAgain(look)}
        actionsRef={actionsRef(look.key)}
        againRef={againRef(look.key)}
      />
    );
  };
  return (
    <LitPanel as="section" aria-labelledby={headingId} className="scroll-mt-4 overflow-hidden [container-type:inline-size]">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-3 pb-3 pt-5 [@container(min-width:30rem)]:px-5">
        <h2 id={headingId} ref={headingRef} tabIndex={-1} className="type-card-title text-ink outline-none">
          {t(`onboarding.business.niches.${trade.niche}`)}
        </h2>
        <TradeStatusLine status={trade.status} />
      </div>
      {gone && (
        <p className="flex items-start gap-1.5 px-3 pb-3 text-sm leading-snug text-ink [@container(min-width:30rem)]:px-5">
          <Info aria-hidden className="mt-px size-4 shrink-0 text-ink-muted" />
          <span>{gone}</span>
        </p>
      )}
      {trade.shown.length > 0 && <ul className="divide-y divide-border border-t border-border">{trade.shown.map(row)}</ul>}
      {trade.notShown.length > 0 && (
        <div className="border-t border-border-strong">
          <h3 className="type-label px-3 pb-1 pt-4 text-ink-muted [@container(min-width:30rem)]:px-5">{t("admin.catalog.notShown")}</h3>
          <ul className="divide-y divide-border">{trade.notShown.map(row)}</ul>
        </div>
      )}
      <div className="border-t border-border px-1 py-1.5 [@container(min-width:30rem)]:px-2">
        <LinkButton
          variant="quiet"
          to="/admin/catalog/new"
          state={{ niche: trade.niche }}
          icon={<Plus aria-hidden />}
          // Its words wrap with large text rather than leave the panel.
          className="!whitespace-normal text-start"
        >
          {t("admin.catalog.createInTrade")}
        </LinkButton>
      </div>
    </LitPanel>
  );
}
