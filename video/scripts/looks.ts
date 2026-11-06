/**
 * The new card looks as the wallet draws them, saved into `public/looks/`
 * (committed, so a render never needs the stack):
 *
 * - every published styled look's own pictures, Apple's strip and Google's
 *   hero, and `catalog.json` listing them with their pictures pointed at
 *   the saved files;
 * - the hero look (gold scissors) drawn at every count from 0 to 10, both
 *   roles, into `public/looks/gold/`.
 *
 * It asks the backend's public endpoints the wizard uses, on the local looks
 * stack by default (backend 8001, passbox 8002): `node scripts/looks.ts
 * [--api http://localhost:8001]`. Drawings are spaced under the throttle; a
 * 429 waits and tries again.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { drawBodyFor, pictureStamps, type CatalogPreset, type DrawRole } from "./drawBody.ts";

const HERO_ID = "barber-gold-scissors";
const at = process.argv.indexOf("--api");
const api = (at >= 0 ? process.argv[at + 1] : "http://localhost:8001").replace(/\/$/, "");
const out = path.join(process.cwd(), "public", "looks");
mkdirSync(path.join(out, "gold"), { recursive: true });

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function bytes(url: string, init?: RequestInit): Promise<Buffer> {
  for (let attempt = 1; ; attempt++) {
    const response = await fetch(url, init);
    if (response.status === 429 && attempt <= 3) {
      console.log(`  429 from ${url}, waiting 10s (attempt ${attempt})`);
      await sleep(10_000);
      continue;
    }
    if (!response.ok) throw new Error(`${response.status} from ${url}`);
    return Buffer.from(await response.arrayBuffer());
  }
}

const presets = (await (await fetch(`${api}/api/presets`)).json()) as CatalogPreset[];
const styled = presets.filter((preset) => preset.pictures);
if (!styled.some((preset) => preset.id === HERO_ID)) throw new Error(`${HERO_ID} isn't published on ${api}`);

const catalog: CatalogPreset[] = [];
for (const preset of styled) {
  const pictures = { strip: `looks/${preset.id}-strip.png`, hero: `looks/${preset.id}-hero.png` };
  writeFileSync(path.join(out, `${preset.id}-strip.png`), await bytes(preset.pictures!.strip));
  writeFileSync(path.join(out, `${preset.id}-hero.png`), await bytes(preset.pictures!.hero));
  catalog.push({ ...preset, pictures });
  console.log(`${preset.id}: its own pictures`);
}
writeFileSync(path.join(out, "catalog.json"), JSON.stringify(catalog, null, 2) + "\n");

const hero = styled.find((preset) => preset.id === HERO_ID)!;
const roles: [DrawRole, string][] = [
  ["strip@2x", "strip"],
  ["hero", "hero"],
];
for (let stamps = 0; stamps <= hero.stamps_required; stamps++) {
  for (const [role, name] of roles) {
    const body = drawBodyFor(hero, stamps, role);
    const png = await bytes(`${api}/api/presets/draw`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    writeFileSync(path.join(out, "gold", `${name}-${stamps}.png`), png);
    console.log(`${HERO_ID} at ${stamps}: ${role}`);
    await sleep(1200);
  }
}

// The drawing asked as the wizard asks it should be the look's own picture.
const own = pictureStamps(hero.stamps_required);
for (const [, name] of roles) {
  const drawn = readFileSync(path.join(out, "gold", `${name}-${own}.png`));
  const published = readFileSync(path.join(out, `${HERO_ID}-${name}.png`));
  console.log(
    drawn.equals(published)
      ? `count ${own} matches the published ${name}`
      : `count ${own} differs from the published ${name} (${drawn.length} vs ${published.length} bytes): look at both`,
  );
}
