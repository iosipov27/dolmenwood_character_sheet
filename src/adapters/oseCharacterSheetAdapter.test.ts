import { describe, expect, it } from "vitest";
import { OseCharacterSheetAdapter } from "./oseCharacterSheetAdapter.js";

describe("OseCharacterSheetAdapter.getArmorClassCandidates", () => {
  it("prefers descending AC paths when ascending AC is disabled", () => {
    const candidates = OseCharacterSheetAdapter.getArmorClassCandidates({
      usesAscendingAC: false
    });

    expect(candidates[0]).toBe("system.ac.value");
    expect(candidates[1]).toBe("system.ac.current");
    expect(candidates[2]).toBe("system.ac");
  });

  it("prefers ascending AC paths when ascending AC is enabled", () => {
    const candidates = OseCharacterSheetAdapter.getArmorClassCandidates({
      usesAscendingAC: true
    });

    expect(candidates[0]).toBe("system.aac.value");
    expect(candidates[1]).toBe("system.aac.current");
    expect(candidates[2]).toBe("system.aac");
  });
});

describe("OseCharacterSheetAdapter.remapDerivedArmorClassEdits", () => {
  it("maps descending AC value edits to system.ac.mod", () => {
    const actor = {
      system: {
        ac: { value: 9, mod: 0 },
        aac: { value: 10, mod: 0 }
      }
    } as unknown as Actor;

    const remapped = OseCharacterSheetAdapter.remapDerivedArmorClassEdits(
      { "system.ac.value": "7" },
      actor
    );

    expect(remapped).not.toHaveProperty("system.ac.value");
    expect(remapped).toHaveProperty("system.ac.mod", 2);
  });

  it("maps ascending AC value edits to system.aac.mod", () => {
    const actor = {
      system: {
        ac: { value: 9, mod: 0 },
        aac: { value: 13, mod: 1 }
      }
    } as unknown as Actor;

    const remapped = OseCharacterSheetAdapter.remapDerivedArmorClassEdits(
      { "system.aac.value": "15" },
      actor
    );

    expect(remapped).not.toHaveProperty("system.aac.value");
    expect(remapped).toHaveProperty("system.aac.mod", 3);
  });

  it("keeps input unchanged when actor AC source values are not numeric", () => {
    const actor = {
      system: {
        ac: { value: "bad", mod: 0 },
        aac: { value: 10, mod: 0 }
      }
    } as unknown as Actor;

    const input = { "system.ac.value": "7" };
    const remapped = OseCharacterSheetAdapter.remapDerivedArmorClassEdits(input, actor);

    expect(remapped).toHaveProperty("system.ac.value", "7");
    expect(remapped).not.toHaveProperty("system.ac.mod");
  });
});
