import { describe, expect, it, vi } from "vitest";
import { buildAbilities } from "./buildAbilities.js";

describe("buildAbilities", () => {
  it("reads ability scores and modifiers from numeric strings", () => {
    vi.stubGlobal("game", {
      i18n: {
        localize: (key: string) => key
      }
    });

    const abilities = buildAbilities({
      abilities: {
        str: { value: "13", mod: "1" },
        dex: { value: "9", mod: "-1" }
      }
    });

    expect(abilities.find((entry) => entry.key === "str")).toMatchObject({
      value: 13,
      hasMod: true,
      mod: 1,
      modText: "+1",
      hasPath: true
    });
    expect(abilities.find((entry) => entry.key === "dex")).toMatchObject({
      value: 9,
      hasMod: true,
      mod: -1,
      modText: "-1",
      hasPath: true
    });
  });
});
