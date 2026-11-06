import { loadFont as loadAssistant } from "@remotion/google-fonts/Assistant";
import { loadFont as loadRoboto } from "@remotion/google-fonts/Roboto";
import { loadFont as loadRubik } from "@remotion/google-fonts/Rubik";

/**
 * The app's faces, the same files `index.html` asks Google Fonts for, by the
 * same family names, so the app's own stacks (`"Rubik", "Rubik Fallback", …`)
 * resolve to them. Each `loadFont` holds the render until its files are in.
 *
 * - Rubik 500 and 700, Hebrew and Latin: headlines, figures, controls.
 * - Assistant 400 and 600, Hebrew and Latin: running text and captions.
 * - Roboto 400 and 500, Latin: the Google Wallet preview, and nothing else.
 *
 * IBM Plex Mono sets card codes only, and the video shows none.
 */
const loads = [
  loadRubik("normal", { weights: ["500", "700"], subsets: ["hebrew", "latin"] }),
  loadAssistant("normal", { weights: ["400", "600"], subsets: ["hebrew", "latin"] }),
  loadRoboto("normal", { weights: ["400", "500"], subsets: ["latin"] }),
];

/** Every face this video sets text in, by family, weight and the subsets it needs. */
const REQUIRED: { family: string; weight: string; subsets: ("hebrew" | "latin")[] }[] = [
  { family: "Rubik", weight: "500", subsets: ["hebrew", "latin"] },
  { family: "Rubik", weight: "700", subsets: ["hebrew", "latin"] },
  { family: "Assistant", weight: "400", subsets: ["hebrew", "latin"] },
  { family: "Assistant", weight: "600", subsets: ["hebrew", "latin"] },
  { family: "Roboto", weight: "400", subsets: ["latin"] },
  { family: "Roboto", weight: "500", subsets: ["latin"] },
];

/** A code point each subset's file covers, to tell the files apart by range. */
const PROBE = { hebrew: 0x05d0, latin: 0x0041 } as const;

function covers(range: string, codePoint: number): boolean {
  return range.split(",").some((part) => {
    const [from, to] = part.trim().replace(/^U\+/i, "").split("-");
    const start = parseInt(from, 16);
    const end = to ? parseInt(to, 16) : start;
    return codePoint >= start && codePoint <= end;
  });
}

/**
 * Resolves once every file above is loaded, and fails the render if one is
 * missing: `src/font-fallbacks.css`'s stand-ins must never reach a frame.
 */
export async function fontsReady(): Promise<void> {
  await Promise.all(loads.map((font) => font.waitUntilDone()));
  await document.fonts.ready;
  const faces = [...document.fonts];
  const missing = REQUIRED.flatMap(({ family, weight, subsets }) =>
    subsets
      .filter(
        (subset) =>
          !faces.some(
            (face) =>
              face.family.replace(/["']/g, "") === family &&
              face.weight === weight &&
              face.status === "loaded" &&
              covers(face.unicodeRange, PROBE[subset]),
          ),
      )
      .map((subset) => `${family} ${weight} ${subset}`),
  );
  if (missing.length > 0) throw new Error(`Fonts not loaded: ${missing.join(", ")}`);
}
