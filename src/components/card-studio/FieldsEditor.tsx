import { useTranslation } from "react-i18next";
import type { DesignField } from "../../api/designs";
import { Button, Input } from "../ui";

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

  const selectClasses =
    "rounded-lg border border-slate/30 bg-white px-2 py-1.5 text-sm font-body text-navy";

  return (
    <div className="flex flex-col gap-4">
      {fields.map((field, index) => (
        <div
          key={`${field.binding}-${index}`}
          className="rounded-xl border border-slate/20 p-3 flex flex-col gap-2.5"
        >
          <div className="flex items-center justify-between gap-2">
            <select
              className={selectClasses}
              value={field.binding}
              onChange={(e) => updateField(index, { binding: e.target.value })}
            >
              {[...new Set([...BINDINGS, field.binding])].map((binding) => (
                <option key={binding} value={binding}>
                  {t(`studio.fields.binding.${binding}`, binding)}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => removeField(index)}
              className="text-xs text-red-600 underline hover:no-underline"
            >
              {t("common.remove")}
            </button>
          </div>

          <Input
            label={t("studio.fields.label")}
            value={field.label ?? ""}
            onChange={(e) => updateField(index, { label: e.target.value })}
          />

          <div className="flex gap-2">
            <label className="flex flex-col gap-1 text-xs text-slate font-body flex-1">
              {t("studio.fields.section")}
              <select
                className={selectClasses}
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
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs text-slate font-body flex-1">
              {t("studio.fields.alignment")}
              <select
                className={selectClasses}
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
              </select>
            </label>
          </div>

          <Input
            label={t("studio.fields.changeMessage")}
            hint={t("studio.fields.changeMessageHint")}
            value={field.change_message ?? ""}
            onChange={(e) => updateField(index, { change_message: e.target.value })}
          />
        </div>
      ))}

      {fields.length < 10 && (
        <Button type="button" variant="secondary" size="sm" onClick={addField}>
          {t("studio.fields.add")}
        </Button>
      )}
    </div>
  );
}
