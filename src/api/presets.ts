import { api } from "./client";
import type { components } from "./generated/schema";

export type Preset = components["schemas"]["PresetOut"];

export function getPresets(niche?: string) {
  return api.get<Preset[]>("/api/presets", { auth: false, query: { niche } });
}
