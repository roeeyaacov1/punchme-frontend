import type { Ref } from "react";
import { useTranslation } from "react-i18next";
import type { DesignField } from "../../../api/designs";
import { Input } from "../../kit/Input";
import {
  FACE_FIELDS,
  TEXT_LIMITS,
  faceLabel,
  faceLabelFull,
  nameMissing,
  ownWordsDir,
  withFaceLabel,
  type CardStudioValue,
} from "../studioDraft";

const FACE_LABELS: Record<(typeof FACE_FIELDS)[number]["binding"], { label: string; placeholder: string }> = {
  "person.displayName": { label: "studio.names.holderLabel", placeholder: "studio.preview.nameLabel" },
  "members.member.points": { label: "studio.names.countLabel", placeholder: "studio.preview.pointsLabel" },
};

/**
 * The words on the card: its name, which Google prints after the business's,
 * the two labels on its face, and the business's name as the pass prints it.
 * These are the only editors of the two labels. Every field stops at the
 * API's own limit, and says the two it can't stop at: a card with no name,
 * and a label whose field the card has no room for.
 */
export function NamesTray({
  value,
  onChange,
  savedFields,
  businessName,
  sayNameMissing,
  nameRef,
}: {
  value: CardStudioValue;
  onChange: (next: CardStudioValue) => void;
  /** The card's fields as saved: a face field it came with stays when its
   * label is cleared. */
  savedFields: readonly DesignField[];
  businessName: string;
  /** Say that the card has no name: at once on a card that had one, and
   * only after Save on a catalog look still being made. */
  sayNameMissing: boolean;
  /** The card's name field, where focus goes when Save finds no name. */
  nameRef?: Ref<HTMLInputElement>;
}) {
  const { t } = useTranslation();
  const fields = value.design.fields ?? [];
  const issuer = value.design.organization_name?.trim() || businessName;
  return (
    <div className="flex flex-col gap-5">
      <Input
        ref={nameRef}
        label={t("studio.nameLabel")}
        value={value.name}
        onChange={(event) => onChange({ ...value, name: event.target.value })}
        maxLength={TEXT_LIMITS.name}
        required
        error={sayNameMissing && nameMissing(value) ? t("studio.names.nameMissing") : undefined}
        dir={ownWordsDir(value.name)}
        autoComplete="off"
        hint={
          <>
            {t("studio.names.google")} <bdi className="text-ink">{`${issuer} - ${value.name.trim() || "…"}`}</bdi>
          </>
        }
      />
      {FACE_FIELDS.map((face) => {
        // A label where there's no field adds one, and the card has no room.
        const full = faceLabelFull(fields, face.binding);
        return (
          <Input
            key={face.binding}
            label={t(FACE_LABELS[face.binding].label)}
            placeholder={t(FACE_LABELS[face.binding].placeholder)}
            hint={full ? t("studio.names.full") : undefined}
            readOnly={full}
            value={faceLabel(fields, face.binding)}
            onChange={(event) =>
              onChange({
                ...value,
                design: {
                  ...value.design,
                  fields: withFaceLabel(fields, face.binding, face.section, event.target.value, savedFields),
                },
              })
            }
            maxLength={TEXT_LIMITS.label}
            dir={ownWordsDir(faceLabel(fields, face.binding))}
            autoComplete="off"
          />
        );
      })}
      <Input
        label={t("studio.names.organization")}
        hint={t("studio.names.organizationHint")}
        placeholder={businessName}
        value={value.design.organization_name ?? ""}
        onChange={(event) => onChange({ ...value, design: { ...value.design, organization_name: event.target.value } })}
        maxLength={TEXT_LIMITS.organization}
        dir={ownWordsDir(value.design.organization_name ?? "")}
        autoComplete="off"
      />
    </div>
  );
}
