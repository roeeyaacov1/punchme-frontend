/**
 * A still of every beat at its settled frame, in both languages, from one
 * bundle and one browser: `npm run stills` (Node 22.18 or later runs the
 * TypeScript as it is). Pass beat ids to render only those, `--lang he` or
 * `--lang en` for one language, or `--frames 150,412` for given frames.
 * They land in `out/stills/`.
 */
import { mkdirSync } from "node:fs";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { webpackOverride } from "../webpack-override.ts";

/** Each beat's settled frames: when what it shows has arrived and holds still. */
const SETTLED: Record<string, number[]> = {
  promise: [0, 40],
  join: [180, 240, 330],
  scan: [380, 430, 520, 560],
  after: [680, 760],
  regulars: [880],
  price: [1050, 1140],
  end: [1250, 1304],
};

const args = process.argv.slice(2);
const flag = (name: string) => {
  const at = args.indexOf(name);
  return at >= 0 ? args[at + 1] : undefined;
};
const langs = flag("--lang") ? [flag("--lang") as string] : ["he", "en"];
const frames = flag("--frames")?.split(",").map(Number);
const only = args.filter((arg, index) => !arg.startsWith("--") && !args[index - 1]?.startsWith("--"));
const beats = only.length > 0 ? only : Object.keys(SETTLED);
const jobs = frames ? frames.map((frame) => ({ name: "frame", frame })) : beats.flatMap((beat) => (SETTLED[beat] ?? []).map((frame) => ({ name: beat, frame })));

const out = path.join(process.cwd(), "out", "stills");
mkdirSync(out, { recursive: true });

const serveUrl = await bundle({ entryPoint: path.join(process.cwd(), "src/index.ts"), webpackOverride });
const browser = await openBrowser("chrome");
try {
  for (const lang of langs) {
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
