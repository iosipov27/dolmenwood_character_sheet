import { describe, expect, it } from "vitest";
import { buildCombat } from "./buildCombat.js";

describe("buildCombat", () => {
  it("uses descending AC value in non-ascending mode", () => {
    const result = buildCombat({
      usesAscendingAC: false,
      ac: { value: 9 },
      aac: { value: 13 }
    });

    expect(result.nameAc).toBe("system.ac.value");
    expect(result.ac).toBe(9);
  });

  it("uses ascending AC value when enabled", () => {
    const result = buildCombat({
      usesAscendingAC: true,
      ac: { value: 9 },
      aac: { value: 14 }
    });

    expect(result.nameAc).toBe("system.aac.value");
    expect(result.ac).toBe(14);
  });

  it("falls back to legacy attributes path when OSE ac paths are missing", () => {
    const result = buildCombat({
      attributes: {
        ac: { value: 15 },
        attack: { value: 1 }
      }
    });

    expect(result.nameAc).toBe("system.attributes.ac.value");
    expect(result.ac).toBe(15);
  });
});
