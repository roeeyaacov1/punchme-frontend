import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../../components/kit/Button";
import { Dialog, Sheet } from "../../components/kit/Dialog";
import { RadioGroup } from "../../components/kit/RadioGroup";
import { useToast } from "../../components/kit/toast-context";
import { GuideSection, Specimen } from "./GuideSection";

/**
 * The dialog and the sheet sit here, at section level, beside the buttons
 * that open them rather than inside anything: rendered in place, they
 * inherit whatever surrounds them.
 */
export function OverlaysSection() {
  const { t } = useTranslation();
  const toast = useToast();
  const [dialog, setDialog] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [appearance, setAppearance] = useState<"light" | "dark" | "system">("system");

  return (
    <GuideSection id="overlays" title={t("styleGuide.overlays.title")} lead={t("styleGuide.overlays.lead")}>
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={() => setDialog(true)}>
          {t("styleGuide.overlays.openDialog")}
        </Button>
        <Button variant="secondary" onClick={() => setSheet(true)}>
          {t("styleGuide.overlays.openSheet")}
        </Button>
      </div>

      <Specimen title={t("styleGuide.overlays.toasts")} lead={t("styleGuide.overlays.toastLead")}>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => toast.show({ tone: "ok", title: t("common.copied") })}>
            {t("styleGuide.overlays.toastOk")}
          </Button>
          <Button
            variant="secondary"
            onClick={() => toast.show({ title: t("dashboard.customers.menu.copied") })}
          >
            {t("styleGuide.overlays.toastNeutral")}
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              toast.show({
                tone: "danger",
                title: t("messaging.errors.generic"),
                action: { label: t("common.retry"), onClick: () => {} },
              })
            }
          >
            {t("styleGuide.overlays.toastDanger")}
          </Button>
        </div>
      </Specimen>

      <Dialog
        open={dialog}
        onClose={() => setDialog(false)}
        title={t("messaging.broadcast.confirmTitle")}
        description={t("messaging.broadcast.confirmBody", { count: 1 })}
        footer={
          <>
            <Button variant="quiet" onClick={() => setDialog(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={() => setDialog(false)}>{t("messaging.broadcast.confirmYes")}</Button>
          </>
        }
      />

      <Sheet
        open={sheet}
        onClose={() => setSheet(false)}
        title={t("dashboard.theme.label")}
        footer={<Button onClick={() => setSheet(false)}>{t("common.save")}</Button>}
      >
        <RadioGroup
          legend={t("dashboard.theme.label")}
          hideLegend
          value={appearance}
          onChange={setAppearance}
          options={[
            { value: "light", label: t("dashboard.theme.light") },
            { value: "dark", label: t("dashboard.theme.dark") },
            { value: "system", label: t("dashboard.theme.system") },
          ]}
        />
      </Sheet>
    </GuideSection>
  );
}
