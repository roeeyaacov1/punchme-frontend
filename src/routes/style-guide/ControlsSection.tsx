import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight, X } from "lucide-react";
import { Button } from "../../components/kit/Button";
import { LinkButton } from "../../components/kit/LinkButton";
import { SegmentedControl } from "../../components/kit/SegmentedControl";
import { Switch } from "../../components/kit/Switch";
import { FormSpecimens } from "./FormSpecimens";
import { GuideSection, Specimen, TokenName } from "./GuideSection";

/** The controls, in the product's own words: every label here is a real key. */
export function ControlsSection() {
  const { t } = useTranslation();
  const [ruleOn, setRuleOn] = useState(true);
  const [wallet, setWallet] = useState<"apple" | "google">("apple");

  return (
    <GuideSection id="controls" title={t("styleGuide.controls.title")} lead={t("styleGuide.controls.lead")}>
      <Specimen title={t("styleGuide.controls.buttons")}>
        <div className="flex flex-col gap-6">
          <Row name="primary · secondary · ink · quiet · danger">
            <Button>{t("landing.hero.cta")}</Button>
            <Button variant="secondary">{t("common.edit")}</Button>
            <Button variant="ink">{t("dashboard.scan.result.redeem")}</Button>
            <Button variant="quiet">{t("dashboard.scan.result.notNow")}</Button>
            <Button variant="danger">{t("common.remove")}</Button>
          </Row>
          <Row name="lg · icon">
            <Button size="lg" iconEnd={<ArrowRight aria-hidden className="rtl:-scale-x-100" />}>
              {t("landing.hero.cta")}
            </Button>
            <Button variant="secondary" size="icon" aria-label={t("common.close")} icon={<X aria-hidden />} />
          </Row>
        </div>
      </Specimen>

      <Specimen title={t("styleGuide.controls.states")}>
        <Row name="busy · disabled">
          <Button busy>{t("common.save")}</Button>
          <Button variant="secondary" busy>
            {t("common.save")}
          </Button>
          <Button disabled>{t("common.next")}</Button>
          <Button variant="secondary" disabled>
            {t("common.next")}
          </Button>
        </Row>
      </Specimen>

      <Specimen title={t("styleGuide.controls.linkButton")}>
        <Row name="LinkButton">
          <LinkButton to="/onboarding" variant="secondary">
            {t("landing.nav.designCta")}
          </LinkButton>
        </Row>
      </Specimen>

      <Specimen title={t("styleGuide.controls.toggles")}>
        <div className="flex flex-col gap-6">
          <Row name="Switch">
            <Switch checked={ruleOn} onChange={setRuleOn} label={t("messaging.automations.switchLabel")} />
            <Switch checked={false} onChange={() => {}} disabled label={t("messaging.automations.switchLabel")} />
          </Row>
          <Row name="SegmentedControl">
            <SegmentedControl
              label={t("styleGuide.controls.wallet")}
              value={wallet}
              onChange={setWallet}
              options={[
                { value: "apple", label: t("studio.preview.apple") },
                { value: "google", label: t("studio.preview.google") },
              ]}
            />
          </Row>
        </div>
      </Specimen>

      <FormSpecimens />
    </GuideSection>
  );
}

function Row({ name, children }: { name: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <TokenName>{name}</TokenName>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}
