import { describe, expect, it } from "vitest";
import type { DwFlags } from "../types/index.js";
import { buildDwUi } from "./buildDwUi.js";

describe("buildDwUi", () => {
  it("builds a plain-text avatar tooltip from the actor name and xp section values", () => {
    const dw = {
      meta: {
        xp: 1234,
        level: 3,
        nextLevel: 2400,
        modifier: 15,
        equipment: {
          tinyItems: ""
        }
      }
    } as unknown as DwFlags;
    const localize = (key: string): string =>
      (
        {
          "DOLMENWOOD.UI.XP": "XP",
          "DOLMENWOOD.UI.Level": "Level",
          "DOLMENWOOD.UI.NextLevel": "Next Level",
          "DOLMENWOOD.UI.Modifier": "Modifier"
        } as Record<string, string>
      )[key] ?? key;

    const ui = buildDwUi(dw, localize, "Rook");

    expect(ui.avatarTooltip).toBe(
      "Rook\nXP: 1234\nLevel: 3\nNext Level: 2400\nModifier: 15"
    );
  });
});
