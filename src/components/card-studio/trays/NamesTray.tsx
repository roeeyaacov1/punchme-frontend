import { useTranslation } from "react-i18next";
import { Input } from "../../kit/Input";
import { FACE_FIELDS, TEXT_LIMITS, faceLabel, withFaceLabel, type CardStudioValue } from "../studioDraft";

const FACE_LABELS: Record<(typeof FACE_FIELDS)[number]["binding"], { label: string; placeholder: string }> = {
  "person.displayName": { label: "studio.names.holderLabel", placeholder: "studio.preview.nameLabel" },
  "members.member.points": { label: "studio.names.countLabel", placeholder: "studio.preview.pointsLabel" },
};

/**
 * The words on the card: its name, which Google prints after the business's,
 * the two labels on its face, and the business's name as the pass prints it.
 * These are the only editors of the two labels. Every field stops at the
 * API's own limit.
 */
export function NamesTray({
  value,
  onChange,
  businessName,
}: {
  value: CardStudioValue;
  onChange: (next: CardStudioValue) => void;
  businessName: string;
}) {
  const { t } = useTranslation();
  const fields = value.design.fields ?? [];
  const issuer = value.design.organization_name?.trim() || businessName;
  return (
    <div className="flex flex-col gap-5">
      <Input
        label={t("studio.nameLabel")}
        value={value.name}
        onChange={(event) => onChange({ ...value, name: event.target.value })}
        maxLength={TEXT_LIMITS.name}
        required
        dir="auto"
        autoComplete="off"
        hint={
          <>
            {t("studio.names.google")} <bdi className="text-ink">{`${issuer} - ${value.name.trim() || "…"}`}</bdi>
          </>
        }
      />
      {FACE_FIELDS.map((face) => (
        <Input
          key={face.binding}
          label={t(FACE_LABELS[face.binding].label)}
          placeholder={t(FACE_LABELS[face.binding].placeholder)}
          value={faceLabel(fields, face.binding)}
          onChange={(event) =>
            onChange({
              ...value,
              design: { ...value.design, fields: withFaceLabel(fields, face.binding, face.section, event.target.value) },
            })
          }
          maxLength={TEXT_LIMITS.label}
          dir="auto"
          autoComplete="off"
        />
      ))}
      <Input
        label={t("studio.names.organization")}
        hint={t("studio.names.organizationHint")}
        placeholder={businessName}
        value={value.design.organization_name ?? ""}
        onChange={(event) => onChange({ ...value, design: { ...value.design, organization_name: event.target.value } })}
        maxLength={TEXT_LIMITS.organization}
        dir="auto"
        autoComplete="off"
      />
    </div>
  );
}
