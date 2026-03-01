import { describe, expect, it } from "vitest";
import { normalizeDwFlags } from "./normalizeDwFlags.js";

describe("normalizeDwFlags", () => {
  it("migrates legacy player fields from meta into player", () => {
    const normalized = normalizeDwFlags({
      meta: {
        kindredClass: "Elf",
        background: "Wanderer",
        alignment: "Lawful",
        affiliation: "Club",
        affiliationVisible: false,
        moonSign: "Waxing",
        moonSignVisible: false
      }
    });

    expect(normalized.player).toEqual({
      kindredClass: "Elf",
      background: "Wanderer",
      alignment: "Lawful",
      affiliation: "Club",
      affiliationVisible: false,
      moonSign: "Waxing",
      moonSignVisible: false
    });

    expect(normalized.meta).not.toHaveProperty("kindredClass");
    expect(normalized.meta).not.toHaveProperty("background");
    expect(normalized.meta).not.toHaveProperty("alignment");
    expect(normalized.meta).not.toHaveProperty("affiliation");
    expect(normalized.meta).not.toHaveProperty("affiliationVisible");
    expect(normalized.meta).not.toHaveProperty("moonSign");
    expect(normalized.meta).not.toHaveProperty("moonSignVisible");
  });
});
