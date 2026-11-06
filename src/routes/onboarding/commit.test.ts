import { beforeEach, describe, expect, it, vi } from "vitest";
import type { QueryClient } from "@tanstack/react-query";

vi.mock("../../api/businesses", () => ({
  createBusiness: vi.fn(),
  createTemplate: vi.fn(),
  getMyBusiness: vi.fn(),
  listTemplates: vi.fn(),
  patchBusiness: vi.fn(),
  patchTemplate: vi.fn(),
}));
vi.mock("../../api/designs", () => ({ uploadTemplateImage: vi.fn() }));

import * as businesses from "../../api/businesses";
import type { Business, CardTemplate, CardTemplateIn } from "../../api/businesses";
import * as designs from "../../api/designs";
import { ApiError } from "../../api/errors";
import { commitDraft, type CommitContext } from "./commit";
import { emptyDraft, type CommittedRecord, type OnboardingDraft, type ResolvedDraft } from "./draft";
import { PictureNotTaken } from "./problems";

/** The save as `commit.ts` runs it, against the API's wrappers: it looks
 * before it creates, patches after Back-and-change, writes nothing when
 * nothing changed, and uploads the card's pictures, the logo first, each
 * once, resuming after one that didn't go (card looks, brief §7.5). */

const api = vi.mocked(businesses);
const upload = vi.mocked(designs.uploadTemplateImage);

const business = { id: "biz-1", name: "Rothschild", niche: "cafe" } as Business;
const template = { id: "tpl-1", design_synced_at: "2026-11-06T10:00:00Z" } as CardTemplate;
const logo = { hash: "logo-1", dataUrl: "data:image/png;base64,AAAA" };
const art = { hash: "art-1", dataUrl: "data:image/png;base64,BBBB" };
const input = { name: "Card", stamps_required: 8, design: { stamp: { sticker: "croissant" } } } as unknown as CardTemplateIn;
const resolved = { name: "Rothschild", niche: "cafe", phone: "" } as ResolvedDraft;
const queryClient = {
  setQueryData: vi.fn(),
  invalidateQueries: vi.fn(() => Promise.resolve()),
} as unknown as QueryClient;

const last = <T,>(list: T[]): T | undefined => list[list.length - 1];

function run(over: Partial<CommitContext> & { committed?: CommittedRecord | null } = {}) {
  const records: CommittedRecord[] = [];
  const draft: OnboardingDraft = { ...emptyDraft(), committed: over.committed ?? null };
  const done = commitDraft({
    draft,
    resolved,
    input,
    art: null,
    logo: null,
    queryClient,
    saveCommitted: (record) => records.push(record),
    ...over,
  });
  return { done, records };
}

beforeEach(() => {
  vi.resetAllMocks();
  api.getMyBusiness.mockResolvedValue(business);
  api.listTemplates.mockResolvedValue([]);
  api.createTemplate.mockResolvedValue(template);
  api.patchTemplate.mockResolvedValue(template);
  upload.mockResolvedValue({ use: "logo", image_id: "img", url: "u" } as never);
});

describe("the first save of a card from a look", () => {
  it("creates the card, then uploads the logo and then the stamp's picture, keeping the record after each", async () => {
    const { done, records } = run({ logo, art });
    await expect(done).resolves.toEqual({ kind: "ready", businessId: "biz-1", templateId: "tpl-1" });
    expect(api.createTemplate).toHaveBeenCalledWith("biz-1", input);
    expect(upload.mock.calls.map(([, , use]) => use)).toEqual(["logo", "stamp_art"]);
    expect(records.map((record) => [record.templateId, record.logoHash, record.artHash])).toEqual([
      ["tpl-1", null, null],
      ["tpl-1", "logo-1", null],
      ["tpl-1", "logo-1", "art-1"],
    ]);
  });

  it("keeps a card from before the looks' record as it was, with no logo in it", async () => {
    const { done, records } = run({ art });
    await done;
    expect(upload.mock.calls.map(([, , use]) => use)).toEqual(["stamp_art"]);
    expect(last(records)).not.toHaveProperty("logoHash");
    expect(last(records)?.artHash).toBe("art-1");
  });
});

describe("a save again", () => {
  const saved: CommittedRecord = {
    businessId: "biz-1",
    templateId: "tpl-1",
    fingerprint: JSON.stringify(input),
    artHash: "art-1",
    logoHash: "logo-1",
    syncBaseline: "2026-11-06T10:00:00Z",
    errorBaseline: "",
  };

  beforeEach(() => {
    api.listTemplates.mockResolvedValue([template]);
  });

  it("writes nothing when nothing changed", async () => {
    await run({ committed: saved, logo, art }).done;
    expect(api.createTemplate).not.toHaveBeenCalled();
    expect(api.patchTemplate).not.toHaveBeenCalled();
    expect(upload).not.toHaveBeenCalled();
  });

  it("patches the card after Back-and-change, never creating another", async () => {
    const changed = { ...input, stamps_required: 10 };
    await run({ committed: saved, logo, art, input: changed }).done;
    expect(api.createTemplate).not.toHaveBeenCalled();
    expect(api.patchTemplate).toHaveBeenCalledWith("biz-1", "tpl-1", changed);
    expect(upload).not.toHaveBeenCalled();
  });

  it("uploads only a logo that changed, onto the same card", async () => {
    const other = { hash: "logo-2", dataUrl: logo.dataUrl };
    const { done, records } = run({ committed: saved, logo: other, art });
    await done;
    expect(api.patchTemplate).not.toHaveBeenCalled();
    expect(upload.mock.calls.map(([, , use]) => use)).toEqual(["logo"]);
    expect(last(records)?.logoHash).toBe("logo-2");
  });
});

describe("a picture that didn't go", () => {
  it("is said as that picture's, and the next save uploads what is left onto the card it made", async () => {
    upload.mockRejectedValueOnce(new ApiError(503, "Service Unavailable"));
    const first = run({ logo, art });
    const failure = await first.done.catch((err: unknown) => err);
    expect(failure).toBeInstanceOf(PictureNotTaken);
    expect((failure as PictureNotTaken).use).toBe("logo");
    const kept = last(first.records)!;
    expect(kept.templateId).toBe("tpl-1");

    api.listTemplates.mockResolvedValue([template]);
    upload.mockClear();
    api.createTemplate.mockClear();
    await run({ committed: kept, logo, art }).done;
    expect(api.createTemplate).not.toHaveBeenCalled();
    expect(api.patchTemplate).not.toHaveBeenCalled();
    expect(upload.mock.calls.map(([, , use]) => use)).toEqual(["logo", "stamp_art"]);
  });
});
