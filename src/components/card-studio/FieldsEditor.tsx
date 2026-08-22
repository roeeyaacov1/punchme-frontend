import { useTranslation } from "react-i18next";
import { Trash2 } from "lucide-react";
import type { DesignField } from "../../api/designs";
import { ctaClasses, focusRing } from "../marketing/primitives";
import { cn } from "../../lib/cn";
import { StudioSelect, StudioText } from "./studio-primitives";

/** The fixed binding vocabulary we expose — anything beyond this has no
 * legitimate owner use case (see plan G2). */
const BINDINGS = [
  "person.displayName",
  "members.member.points",
  "members.tier.name",
  "universal.info",
  "meta.custom",
] as const;

const SECTIONS = [
  "HEADER_FIELDS",
  "PRIMARY_FIELDS",
  "SECONDARY_FIELDS",
  "AUXILIARY_FIELDS",
  "BACK_FIELDS",
] as const;

const ALIGNMENTS = ["NATURAL", "LEFT", "CENTER", "RIGHT"] as const;

export interface FieldsEditorProps {
  fields: DesignField[];
  onChange: (fields: DesignField[]) => void;
}

export function FieldsEditor({ fields, onChange }: FieldsEditorProps) {
  const { t } = useTranslation();

  function updateField(index: number, patch: Partial<DesignField>) {
    onChange(fields.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  }

  function removeField(index: number) {
    onChange(fields.filter((_, i) => i !== index));
  }

  function addField() {
    const used = new Set(fields.map((f) => f.binding));
    const binding = BINDINGS.find((b) => !used.has(b)) ?? "meta.custom";
    onChange([
      ...fields,
      { binding, label: "", section: "BACK_FIELDS", alignment: "NATURAL" },
    ]);
  }

  return (
    <div className="flex flex-col gap-3">
      {fields.map((field, index) => (
        <div
          key={`${field.binding}-${index}`}
          className="flex flex-col gap-3 rounded-xl border border-border bg-background p-3"
        >
          <div className="flex items-end justify-between gap-2">
            <StudioSelect
              label={t("studio.fields.bindingLabel")}
              value={field.binding}
              onChange={(e) => updateField(index, { binding: e.target.value })}
            >
              {[...new Set([...BINDINGS, field.binding])].map((binding) => (
                <option key={binding} value={binding}>
                  {t(`studio.fields.binding.${binding}`, binding)}
                </option>
              ))}
            </StudioSelect>
            <button
              type="button"
              onClick={() => removeField(index)}
              aria-label={t("common.remove")}
              title={t("common.remove")}
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border text-ink-muted",
                "transition-colors hover:border-danger hover:bg-danger-bg hover:text-danger",
                focusRing,
              )}
            >
              <Trash2 size={16} aria-hidden="true" />
            </button>
          </div>

          <StudioText
            label={t("studio.fields.label")}
            value={field.label ?? ""}
            onChange={(e) => updateField(index, { label: e.target.value })}
          />

          <div className="flex flex-wrap gap-3">
            <StudioSelect
              label={t("studio.fields.section")}
              value={field.section ?? "BACK_FIELDS"}
              onChange={(e) =>
                updateField(index, { section: e.target.value as DesignField["section"] })
              }
            >
              {SECTIONS.map((section) => (
                <option key={section} value={section}>
                  {t(`studio.fields.sections.${section}`)}
                </option>
              ))}
            </StudioSelect>
            <StudioSelect
              label={t("studio.fields.alignment")}
              value={field.alignment ?? "NATURAL"}
              onChange={(e) =>
                updateField(index, { alignment: e.target.value as DesignField["alignment"] })
              }
            >
              {ALIGNMENTS.map((alignment) => (
                <option key={alignment} value={alignment}>
                  {t(`studio.fields.alignments.${alignment}`)}
                </option>
              ))}
            </StudioSelect>
          </div>

          <StudioText
            label={t("studio.fields.changeMessage")}
            hint={t("studio.fields.changeMessageHint")}
            value={field.change_message ?? ""}
            onChange={(e) => updateField(index, { change_message: e.target.value })}
          />
        </div>
      ))}

      {fields.length < 10 && (
        <button type="button" onClick={addField} className={ctaClasses("secondary", "sm", "w-fit")}>
          {t("studio.fields.add")}
        </button>
      )}
    </div>
  );
}
