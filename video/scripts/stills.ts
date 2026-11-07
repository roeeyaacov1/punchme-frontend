/**
 * Stills for checking, from one bundle and one browser (Node 22.18 or later
 * runs the TypeScript as it is), into `out/stills/`:
 *
 * - `npm run stills`: every beat at its settled frames, both languages;
 *   beat ids narrow it, `--lang he` or `--lang en` picks one language;
 * - `npm run stills -- --frames 78,84`: those frames, full size;
 * - `npm run stills -- --sheet 75,78,84,91 [--cols 4] [--name punch]`: one
 *   contact sheet of those frames at a quarter size, per language.
 */
import { mkdirSync } from "node:fs";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { webpackOverride } from "../webpack-override.ts";

/** Each beat's settled frames: when what it shows has arrived and holds still. */
const SETTLED: Record<string, number[]> = {
  hook: [50],
  promise: [115],
  join: [200],
  looks: [290],
  stamps: [340, 385],
  reward: [445],
  winback: [505],
  price: [565],
  end: [689],
};

const args = process.argv.slice(2);
const flag = (name: string) => {
  const at = args.indexOf(name);
  return at >= 0 ? args[at + 1] : undefined;
};
const list = (value: string | undefined) => value?.split(",").map(Number);
const langs = flag("--lang") ? [flag("--lang") as "he" | "en"] : (["he", "en"] as const);
const frames = list(flag("--frames"));
const sheet = list(flag("--sheet"));
const cols = Number(flag("--cols") ?? 4);
const sheetName = flag("--name") ?? "sheet";
const only = args.filter((arg, index) => !arg.startsWith("--") && !args[index - 1]?.startsWith("--"));
const beats = only.length > 0 ? only : Object.keys(SETTLED);
const jobs = frames ? frames.map((frame) => ({ name: "frame", frame })) : beats.flatMap((beat) => (SETTLED[beat] ?? []).map((frame) => ({ name: beat, frame })));

const out = path.join(process.cwd(), "out", "stills");
mkdirSync(out, { recursive: true });

const serveUrl = await bundle({ entryPoint: path.join(process.cwd(), "src/index.ts"), webpackOverride });
const browser = await openBrowser("chrome");
try {
  for (const lang of langs) {
    if (sheet) {
      const inputProps = { lang, frames: sheet, cols };
      const composition = await selectComposition({ serveUrl, id: "Sheet", inputProps, puppeteerInstance: browser });
      const output = path.join(out, `${sheetName}-${lang}.png`);
      await renderStill({ serveUrl, composition, inputProps, frame: 0, output, puppeteerInstance: browser, overwrite: true, timeoutInMilliseconds: 120000 });
      console.log(output);
      continue;
    }
    const id = lang === "he" ? "PromoHe" : "PromoEn";
    const composition = await selectComposition({ serveUrl, id, puppeteerInstance: browser });
    for (const { name, frame } of jobs) {
      const output = path.join(out, `${lang}-${name}-${frame}.png`);
      await renderStill({ serveUrl, composition, frame, output, puppeteerInstance: browser, overwrite: true });
      console.log(output);
    }
  }
} finally {
  await browser.close({ silent: true });
}
