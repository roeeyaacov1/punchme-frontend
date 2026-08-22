import { useTranslation } from "react-i18next";
import type { DesignField } from "../../api/designs";
import { StudioGroupLabel, StudioText } from "./studio-primitives";

/** The two labels that actually show on the face of the card in both
 * wallets. Anything beyond these lives in the full FieldsEditor. */
const FACE_FIELDS = [
  {
    binding: "person.displayName",
    fallbackKey: "studio.preview.nameLabel",
    section: "SECONDARY_FIELDS",
  },
  {
    binding: "members.member.points",
    fallbackKey: "studio.preview.pointsLabel",
    section: "AUXILIARY_FIELDS",
  },
] as const;

export interface LabelsEditorProps {
  fields: DesignField[];
  onChange: (fields: DesignField[]) => void;
}

/** Rename what the card calls the customer's name and their stamp count.
 * Writes into the same design.fields array the FieldsEditor edits, so the
 * two stay in sync. */
export function LabelsEditor({ fields, onChange }: LabelsEditorProps) {
  const { t } = useTranslation();

  function setLabel(
    binding: string,
    section: DesignField["section"],
    label: string,
  ) {
    const index = fields.findIndex((f) => f.binding === binding);
    if (index === -1) {
      if (!label) return;
      onChange([...fields, { binding, label, section, alignment: "NATURAL" }]);
      return;
    }
    // Clearing a label we implicitly created drops the field again rather
    // than shipping an empty label to the renderer.
    const field = fields[index];
    if (!label && isDefaultShape(field, section)) {
      onChange(fields.filter((_, i) => i !== index));
      return;
    }
    onChange(fields.map((f, i) => (i === index ? { ...f, label } : f)));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <StudioGroupLabel>{t("studio.labelsLabel")}</StudioGroupLabel>
        <p className="text-xs text-ink-subtle">{t("studio.labelsHint")}</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {FACE_FIELDS.map(({ binding, fallbackKey, section }) => (
          <StudioText
            key={binding}
            label={t(`studio.fields.binding.${binding}`)}
            placeholder={t(fallbackKey)}
            value={fields.find((f) => f.binding === binding)?.label ?? ""}
            onChange={(e) => setLabel(binding, section, e.target.value)}
          />
        ))}
      </div>
    </div>
  );
}

function isDefaultShape(field: DesignField, section: DesignField["section"]) {
  return (
    field.section === section &&
    !field.change_message &&
    !field.default_value &&
    (field.alignment === "NATURAL" || field.alignment === undefined)
  );
}
