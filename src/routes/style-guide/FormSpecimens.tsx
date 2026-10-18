import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { Checkbox } from "../../components/kit/Checkbox";
import { Input } from "../../components/kit/Input";
import { RadioGroup } from "../../components/kit/RadioGroup";
import { Select } from "../../components/kit/Select";
import { Slider } from "../../components/kit/Slider";
import { Tab, TabList, TabPanel, Tabs } from "../../components/kit/Tabs";
import { Textarea } from "../../components/kit/Textarea";
import { MESSAGE_LIMITS } from "../../components/messaging/MessageForm";
import { Specimen } from "./GuideSection";

/** Fields, choices, tabs and the slider, in copy the product already uses. */
export function FormSpecimens() {
  const { t } = useTranslation();
  const [message, setMessage] = useState("");
  const [gift, setGift] = useState(true);
  const [repeat, setRepeat] = useState(false);
  const [appearance, setAppearance] = useState<"light" | "dark" | "system">("system");
  const [section, setSection] = useState("customers");
  const [stamps, setStamps] = useState(8);

  return (
    <>
      <Specimen title={t("styleGuide.controls.fields")} lead={t("styleGuide.controls.fieldsLead")}>
        <div className="grid max-w-3xl gap-6 sm:grid-cols-2">
          <Input
            label={t("onboarding.business.nameLabel")}
            placeholder={t("onboarding.business.namePlaceholder")}
            dir="auto"
          />
          <Input
            label={t("messaging.editor.name")}
            placeholder={t("messaging.editor.namePlaceholder")}
            error={t("messaging.errors.name_required")}
            dir="auto"
          />
          <Input
            label={t("dashboard.customers.searchLabel")}
            placeholder={t("dashboard.customers.searchPlaceholder")}
            type="search"
            leading={<Search />}
          />
          <Input
            label={t("enroll.phoneRequiredLabel")}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            dir="ltr"
          />
          <Select label={t("dashboard.customers.filter.label")} defaultValue="all">
            <option value="all">{t("dashboard.customers.filter.all")}</option>
            <option value="ready">{t("dashboard.customers.filter.ready")}</option>
            <option value="oneAway">{t("dashboard.customers.filter.oneAway")}</option>
            <option value="progress">{t("dashboard.customers.filter.progress")}</option>
            <option value="new">{t("dashboard.customers.filter.new")}</option>
          </Select>
          <Input
            label={t("onboarding.business.nameLabel")}
            placeholder={t("onboarding.business.namePlaceholder")}
            disabled
          />
          <Textarea
            className="sm:col-span-2"
            label={t("messaging.editor.body")}
            placeholder={t("messaging.editor.bodyPlaceholder")}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            maxLength={MESSAGE_LIMITS.body}
            count={t("messaging.editor.chars", { used: message.length, max: MESSAGE_LIMITS.body })}
            dir="auto"
          />
        </div>
      </Specimen>

      <Specimen title={t("styleGuide.controls.choices")}>
        <div className="grid max-w-3xl gap-6 sm:grid-cols-2">
          <div className="flex flex-col">
            <Checkbox checked={gift} onChange={setGift} label={t("messaging.editor.giftToggle")} />
            <Checkbox checked={repeat} onChange={setRepeat} label={t("messaging.editor.repeat")} />
            <Checkbox checked={false} onChange={() => {}} disabled label={t("messaging.editor.giftFull")} />
          </div>
          <RadioGroup
            legend={t("dashboard.theme.label")}
            value={appearance}
            onChange={setAppearance}
            options={[
              { value: "light", label: t("dashboard.theme.light") },
              { value: "dark", label: t("dashboard.theme.dark") },
              { value: "system", label: t("dashboard.theme.system") },
            ]}
          />
        </div>
      </Specimen>

      <Specimen title={t("styleGuide.controls.tabs")}>
        <Tabs value={section} onChange={setSection}>
          <TabList label={t("dashboard.nav.label")}>
            {(["overview", "customers", "activity"] as const).map((name) => (
              <Tab key={name} value={name}>
                {t(`dashboard.nav.${name}`)}
              </Tab>
            ))}
          </TabList>
          {(["overview", "customers", "activity"] as const).map((name) => (
            <TabPanel key={name} value={name} className="py-5">
              <p className="type-body text-ink-muted">
                {t("styleGuide.controls.tabPanel", { name: t(`dashboard.nav.${name}`) })}
              </p>
            </TabPanel>
          ))}
        </Tabs>
      </Specimen>

      <Specimen title={t("styleGuide.controls.slider")}>
        <Slider
          className="max-w-md"
          label={t("onboarding.reward.stampsLabel")}
          value={stamps}
          min={2}
          max={12}
          onChange={setStamps}
          valueText={t("onboarding.reward.stampsValue", { count: stamps })}
          hint={t("onboarding.design.stampsRequiredHint", { count: stamps })}
        />
      </Specimen>
    </>
  );
}
