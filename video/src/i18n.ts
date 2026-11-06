import i18next, { type i18n } from "i18next";
import enCommon from "../../src/i18n/locales/en/common.json";
import heCommon from "../../src/i18n/locales/he/common.json";
import enVideo from "./locales/en.json";
import heVideo from "./locales/he.json";

export type Lang = "he" | "en";

/**
 * The video's own i18next, with the language fixed per composition. The
 * app's copy is its `common` namespace, read straight from the app's locale
 * files, so the video says what the site says. `video` holds only what the
 * video needs that the site doesn't have word for word: shorter captions cut
 * from the site's sentences, and the iPhone label.
 *
 * No detector and no storage: the app's own `src/i18n` reads the browser,
 * and a render must not depend on one.
 */
function instance(lng: Lang): i18n {
  const made = i18next.createInstance();
  void made.init({
    resources: {
      he: { common: heCommon, video: heVideo },
      en: { common: enCommon, video: enVideo },
    },
    lng,
    fallbackLng: "en",
    ns: ["common", "video"],
    defaultNS: "common",
    interpolation: { escapeValue: false },
    initAsync: false,
    react: { useSuspense: false },
  });
  return made;
}

export const I18N: Record<Lang, i18n> = { he: instance("he"), en: instance("en") };
