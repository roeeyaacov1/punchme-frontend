import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AlignCenter, AlignLeft, AlignRight, ArrowLeft, Plus, TriangleAlert, Type } from "lucide-react";
import type { DesignDoc, DesignField } from "../../../api/designs";
import { Button } from "../../kit/Button";
import { Dialog } from "../../kit/Dialog";
import { Input } from "../../kit/Input";
import { List, ListRow } from "../../kit/ListRow";
import { Select } from "../../kit/Select";
import { Textarea } from "../../kit/Textarea";
import { isolate } from "../../../routes/dashboard/problem";
import { ChoiceTiles, type Tile } from "../controls/ChoiceTiles";
import { problemsFor, type LintReading } from "../lintProblems";
import { fitPicture, pictureSize, readPicture, STRIP_MIN, type FittedUse } from "../pictureFiles";
import {
  BACK_BINDING,
  MAX_FIELDS,
  TEXT_LIMITS,
  addableKinds,
  kindOf,
  newField,
  nextCustomBinding,
  type CardStudioImages,
  type CardStudioValue,
  type FieldKind,
  type HeldPictures,
  type HeldUse,
} from "../studioDraft";
import { UploadTile } from "../UploadTile";

const SECTIONS = ["HEADER_FIELDS", "PRIMARY_FIELDS", "SECONDARY_FIELDS", "AUXILIARY_FIELDS", "BACK_FIELDS"] as const;
const ALIGNMENTS = ["NATURAL", "START", "CENTER", "END"] as const;
type Alignment = (typeof ALIGNMENTS)[number];
const BARCODES = ["QR", "PDF417", "AZTEC", "CODE128"] as const;
/** Google draws these two on the card's face; every other field in the details. */
const GOOGLE_FACE = ["person.displayName", "members.member.points"];
/** A stamp count, for the change message's example. */
const EXAMPLE_VALUE = "5";

type ArtTileUse = Exclude<FittedUse, "logo">;

const ART: { use: ArtTileUse; aspect: string }[] = [
  { use: "strip_base", aspect: "1125 / 432" },
  { use: "stamped_art", aspect: "1 / 1" },
  { use: "unstamped_art", aspect: "1 / 1" },
];

export interface WalletArt {
  held: HeldPictures;
  images: CardStudioImages;
  /** The art the card has, which the design read names but doesn't carry. */
  assets: readonly string[];
  /** Held pictures that didn't fit the tab's storage. */
  notKept: readonly HeldUse[];
  onPick: (use: HeldUse, dataUrl: string) => void;
}

/**
 * Wallet details, the tray an owner rarely opens, in plain words: the pass's
 * fields as one row each, a field's editor, the card's language and its
 * barcode, and custom art. A pass aligns by left and right, so alignment is
 * offered by the card's own language and the physical side shown as an icon.
 */
export function WalletDetailsTray({
  value,
  onChange,
  lint,
  editing,
  onEditing,
  art,
}: {
  value: CardStudioValue;
  onChange: (next: CardStudioValue) => void;
  lint: LintReading;
  /** The field open in its editor, or null for the list. */
  editing: number | null;
  onEditing: (index: number | null) => void;
  /** The owner's custom art, held for Save. A catalog look keeps its own. */
  art?: WalletArt;
}) {
  const { t } = useTranslation();
  const fields = value.design.fields ?? [];
  const setDesign = (patch: Partial<DesignDoc>) => onChange({ ...value, design: { ...value.design, ...patch } });
  const setFields = (next: DesignField[]) => setDesign({ fields: next });

  const kindName = (field: DesignField) => {
    const kind = kindOf(field.binding);
    return kind ? t(`studio.fields.binding.${kind}`) : field.binding;
  };
  const nameOf = (field: DesignField) => field.label?.trim() || kindName(field);

  if (editing !== null && fields[editing]) {
    return (
      <FieldEditor
        field={fields[editing]}
        index={editing}
        fields={fields}
        rtl={(value.design.default_language ?? "HE") === "HE"}
        lint={lint}
        nameOf={nameOf}
        onBack={() => onEditing(null)}
        onField={(next) => setFields(fields.map((field, i) => (i === editing ? next : field)))}
        onRemove={() => {
          setFields(fields.filter((_, i) => i !== editing));
          onEditing(null);
        }}
      />
    );
  }

  const addable = addableKinds(fields);
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-2" aria-labelledby="studio-fields-heading">
        <h3 id="studio-fields-heading" className="type-label text-ink">
          {t("studio.fields.title")}
        </h3>
        <List className="-mx-4 sm:-mx-5">
          {fields.map((field, index) => {
            const problems = problemsFor(lint, field.binding, index);
            return (
              <ListRow
                key={`${field.binding}-${index}`}
                title={<bdi>{nameOf(field)}</bdi>}
                meta={
                  problems.length > 0
                    ? t("studio.check.row")
                    : t(`studio.fields.places.${field.section ?? "BACK_FIELDS"}`)
                }
                trailing={problems.length > 0 ? <TriangleAlert aria-hidden className="size-5 text-warn" /> : undefined}
                chevron
                onClick={() => onEditing(index)}
              />
            );
          })}
        </List>
        {addable.length > 0 && (
          <Button
            variant="secondary"
            icon={<Plus aria-hidden />}
            className="w-fit"
            onClick={() => {
              setFields([...fields, newField("meta.custom", fields)]);
              onEditing(fields.length);
            }}
          >
            {t("studio.fields.add")}
          </Button>
        )}
        {fields.length >= MAX_FIELDS && <p className="text-sm text-ink-muted">{t("studio.fields.full", { count: MAX_FIELDS })}</p>}
      </section>

      <Select
        label={t("studio.languageLabel")}
        hint={t("studio.languageHint")}
        value={value.design.default_language ?? "HE"}
        onChange={(event) => setDesign({ default_language: event.target.value as "HE" | "EN" })}
      >
        <option value="HE">{t("studio.languages.HE")}</option>
        <option value="EN">{t("studio.languages.EN")}</option>
      </Select>

      <Select
        label={t("studio.barcodeLabel")}
        value={value.design.barcode?.format ?? "QR"}
        onChange={(event) =>
          setDesign({
            barcode: { ...value.design.barcode, format: event.target.value as (typeof BARCODES)[number] },
          })
        }
      >
        {BARCODES.map((format) => (
          <option key={format} value={format}>
            {t(`studio.barcodes.${format}`)}
          </option>
        ))}
      </Select>

      {art && (
        <section className="flex flex-col gap-4" aria-labelledby="studio-art-heading">
          <div className="flex flex-col gap-1">
            <h3 id="studio-art-heading" className="type-label text-ink">
              {t("studio.artTitle")}
            </h3>
            <p className="text-sm leading-snug text-ink-muted">{t("studio.artHint")}</p>
          </div>
          {ART.map(({ use, aspect }) => (
            <ArtTile key={use} use={use} aspect={aspect} art={art} ground={value.background_color} />
          ))}
        </section>
      )}
    </div>
  );
}

function ArtTile({ use, aspect, art, ground }: { use: ArtTileUse; aspect: string; art: WalletArt; ground: string }) {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const src = art.held[use] ?? art.images[use as keyof CardStudioImages];
  return (
    <UploadTile
      title={t(`admin.catalog.art.uses.${use}.label`)}
      hint={t(`admin.catalog.art.uses.${use}.hint`)}
      src={typeof src === "string" ? src : undefined}
      onCard={art.assets.includes(use)}
      aspect={aspect}
      ground={ground}
      error={error}
      note={art.notKept.includes(use) ? t("studio.picture.notKept") : undefined}
      onFile={async (file) => {
        setError(null);
        try {
          const dataUrl = await readPicture(file);
          if (use === "strip_base") {
            const size = await pictureSize(dataUrl);
            if (size.width < STRIP_MIN.width || size.height < STRIP_MIN.height) {
              setError(t("studio.problem.small", size));
              return;
            }
          }
          art.onPick(use, await fitPicture(dataUrl, use));
        } catch (err) {
          setError(
            err instanceof Error && err.message === "too large"
              ? t("onboarding.stamp.uploadTooLarge")
              : t("onboarding.stamp.uploadUnreadable"),
          );
        }
      }}
    />
  );
}

/** PassKit's alignment from the card's language: start is the right in Hebrew. */
function toPass(alignment: Alignment, rtl: boolean): NonNullable<DesignField["alignment"]> {
  if (alignment === "START") return rtl ? "RIGHT" : "LEFT";
  if (alignment === "END") return rtl ? "LEFT" : "RIGHT";
  return alignment;
}

function fromPass(alignment: DesignField["alignment"], rtl: boolean): Alignment {
  if (alignment === "LEFT") return rtl ? "END" : "START";
  if (alignment === "RIGHT") return rtl ? "START" : "END";
  return alignment === "CENTER" ? "CENTER" : "NATURAL";
}

function FieldEditor({
  field,
  index,
  fields,
  rtl,
  lint,
  nameOf,
  onBack,
  onField,
  onRemove,
}: {
  field: DesignField;
  index: number;
  fields: DesignField[];
  rtl: boolean;
  lint: LintReading;
  nameOf: (field: DesignField) => string;
  onBack: () => void;
  onField: (next: DesignField) => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const [confirming, setConfirming] = useState(false);
  const kind = kindOf(field.binding);
  const others = fields.filter((_, i) => i !== index);
  const kinds: FieldKind[] = [...new Set([...(kind ? [kind] : []), ...addableKinds(others)])];
  const problems = problemsFor(lint, field.binding, index);
  const last = fields.length <= 1;
  const name = nameOf(field);

  const icons: Record<Alignment, typeof AlignLeft> = {
    NATURAL: Type,
    START: rtl ? AlignRight : AlignLeft,
    CENTER: AlignCenter,
    END: rtl ? AlignLeft : AlignRight,
  };
  const alignTiles: Tile<Alignment>[] = ALIGNMENTS.map((alignment) => {
    const Icon = icons[alignment];
    return {
      value: alignment,
      label: t(`studio.fields.align.${alignment}`),
      render: () => (
        <span className="flex items-center gap-2 px-4 type-label text-ink">
          <Icon aria-hidden className="size-4" />
          {t(`studio.fields.align.${alignment}`)}
        </span>
      ),
    };
  });

  const message = field.change_message ?? "";
  const example = message.includes("%@") ? message.split("%@").join(EXAMPLE_VALUE) : message;

  return (
    <div className="flex flex-col gap-5">
      <Button variant="quiet" icon={<ArrowLeft aria-hidden className="rtl:rotate-180" />} onClick={onBack} className="-ms-3 w-fit">
        {t("studio.fields.all")}
      </Button>

      {problems.length > 0 && (
        <p className="flex items-start gap-1.5 text-sm font-semibold leading-snug text-ink">
          <TriangleAlert aria-hidden className="mt-px size-4 shrink-0 text-warn" />
          <span>{t("studio.check.field", { label: isolate(name) })}</span>
        </p>
      )}

      <Select
        label={t("studio.fields.shows")}
        value={kind ?? field.binding}
        onChange={(event) => {
          const next = event.target.value as FieldKind;
          const binding = next === "meta.custom" ? nextCustomBinding(others) : next;
          onField({ ...field, binding });
        }}
      >
        {!kind && <option value={field.binding}>{field.binding}</option>}
        {kinds.map((option) => (
          <option key={option} value={option}>
            {t(`studio.fields.binding.${option}`)}
          </option>
        ))}
      </Select>

      <Input
        label={t("studio.fields.label")}
        value={field.label ?? ""}
        onChange={(event) => onField({ ...field, label: event.target.value })}
        maxLength={TEXT_LIMITS.label}
        dir="auto"
        autoComplete="off"
      />

      <Select
        label={t("studio.fields.place")}
        hint={t(GOOGLE_FACE.includes(field.binding) ? "studio.fields.googleFace" : "studio.fields.googleDetails")}
        value={field.section ?? "BACK_FIELDS"}
        onChange={(event) => onField({ ...field, section: event.target.value as DesignField["section"] })}
      >
        {SECTIONS.map((section) => (
          <option key={section} value={section}>
            {t(`studio.fields.places.${section}`)}
          </option>
        ))}
      </Select>

      <ChoiceTiles
        legend={t("studio.fields.alignment")}
        tiles={alignTiles}
        value={fromPass(field.alignment, rtl)}
        onChange={(alignment) => onField({ ...field, alignment: toPass(alignment, rtl) })}
        shape="pill"
        listClassName="gap-2"
      />

      {/* The back field carries the reward; a free-text field says what it's
          given, as a repeated line of text mended into one does. */}
      {(field.binding === BACK_BINDING || kind === "meta.custom") && (
        <Textarea
          label={t("studio.fields.backText")}
          hint={field.binding === BACK_BINDING ? t("studio.fields.backTextHint") : undefined}
          value={field.default_value ?? ""}
          onChange={(event) => onField({ ...field, default_value: event.target.value })}
          maxLength={TEXT_LIMITS.value}
          dir="auto"
        />
      )}

      <Input
        label={t("studio.fields.changeMessage")}
        hint={
          message ? (
            <>
              {t("studio.fields.example")} <bdi className="text-ink">{example}</bdi>
            </>
          ) : (
            <>
              {t("studio.fields.changeHint")} <bdi dir="ltr">%@</bdi>
            </>
          )
        }
        value={message}
        onChange={(event) => onField({ ...field, change_message: event.target.value })}
        maxLength={TEXT_LIMITS.changeMessage}
        dir="auto"
        autoComplete="off"
      />

      <div className="flex flex-col items-start gap-1">
        <Button
          variant="danger"
          disabled={last}
          onClick={() => setConfirming(true)}
          aria-label={t("studio.fields.removeNamed", { name: isolate(name) })}
        >
          {t("studio.fields.remove")}
        </Button>
        {last && <p className="text-sm leading-snug text-ink-muted">{t("studio.fields.lastOne")}</p>}
      </div>

      <Dialog
        open={confirming}
        onClose={() => setConfirming(false)}
        title={t("studio.fields.removeTitle", { name: isolate(name) })}
        description={t("studio.fields.removeBody")}
        footer={
          <>
            <Button variant="quiet" onClick={() => setConfirming(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setConfirming(false);
                onRemove();
              }}
            >
              {t("studio.fields.remove")}
            </Button>
          </>
        }
      />
    </div>
  );
}
