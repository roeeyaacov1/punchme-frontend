import { useTranslation } from "react-i18next";
import { SegmentedControl } from "../../components/kit/SegmentedControl";
import { Switch } from "../../components/kit/Switch";
import type { GuideView } from "./useGuideView";

/**
 * The guide's three switches, built from the kit they show. Day and night
 * reuse the dashboard's own words for them.
 */
export function Toolbar({ view }: { view: GuideView }) {
  const { t } = useTranslation();
  return (
    <div
      role="group"
      aria-label={t("styleGuide.toolbar.label")}
      className="mx-auto flex max-w-5xl flex-wrap items-end gap-x-4 gap-y-3 px-4 py-3 sm:gap-x-6 sm:px-6"
    >
      <SegmentedControl
        label={t("styleGuide.toolbar.language")}
        hideLabel
        value={view.language}
        onChange={view.setLanguage}
        options={[
          { value: "he", label: t("language.he") },
          { value: "en", label: t("language.en") },
        ]}
      />
      <SegmentedControl
        label={t("dashboard.theme.label")}
        hideLabel
        value={view.night ? "dark" : "light"}
        onChange={(next) => view.setNight(next === "dark")}
        options={[
          { value: "light", label: t("dashboard.theme.light") },
          { value: "dark", label: t("dashboard.theme.dark") },
        ]}
      />
      <Switch
        checked={view.reduced}
        onChange={view.setReduced}
        label={t("styleGuide.toolbar.reducedMotion")}
        description={t("styleGuide.toolbar.reducedMotionHint")}
        className="max-w-xs"
      />
    </div>
  );
}
