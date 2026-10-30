import { describe, expect, it } from "vitest";
import type { CardPublic } from "../../api/loyalty";
import { NO_HOLDER_NAME, publicCardPreview } from "./publicCard";

const card = {
  business_name: "Demo Coffee",
  template_name: "כרטיסיית קפה",
  stamps_required: 8,
  stamp_count: 3,
  reward_description: "קפה חינם",
  background_color: "#4a2c1f",
  foreground_color: "#ffffff",
  label_color: "#e8c39e",
} as CardPublic;

describe("publicCardPreview", () => {
  it("prints the name the customer gave, as they gave it", () => {
    expect(publicCardPreview(card, "serial-1", "נוי כהן").holderName).toBe("נוי כהן");
    expect(publicCardPreview(card, "serial-1", "  Noy Cohen ").holderName).toBe("Noy Cohen");
  });

  it("prints no one's name when the page has none, never the previews' sample", () => {
    for (const none of [undefined, "", "   "]) {
      const { holderName } = publicCardPreview(card, "serial-1", none);
      expect(holderName).toBe(NO_HOLDER_NAME);
      // Something the previews print as it is: `holderName || sample`.
      expect(Boolean(holderName)).toBe(true);
      expect(holderName?.trim()).toBe("");
    }
  });
});
