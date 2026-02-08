import { afterEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "../../test/flushPromises.js";
import { registerAttackRollListener } from "./attack-roll.listener.js";

describe("registerAttackRollListener", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("rolls melee attack and posts message with localized labels", async () => {
    const localizeMap: Record<string, string> = {
      "DOLMENWOOD.UI.MeleeAttack": "Melee Attack",
      "DOLMENWOOD.UI.RangedAttack": "Ranged Attack",
      "DOLMENWOOD.Ability.Strength": "Strength",
      "DOLMENWOOD.Ability.Dexterity": "Dexterity"
    };

    vi.stubGlobal("game", {
      i18n: { localize: (key: string) => localizeMap[key] ?? key }
    });

    const postedMessage = vi.fn(async () => {});
    const builtRolls: Array<{ formula: string; mod: number }> = [];

    class MockRoll {
      constructor(formula: string, data: { mod: number }) {
        builtRolls.push({ formula, mod: data.mod });
      }

      async evaluate(): Promise<this> {
        return this;
      }

      async toMessage(payload: unknown): Promise<void> {
        await postedMessage(payload);
      }
    }

    const getSpeaker = vi.fn(() => ({ alias: "Actor" }));

    vi.stubGlobal("Roll", MockRoll);
    vi.stubGlobal("ChatMessage", { getSpeaker });

    document.body.innerHTML = `<button data-action="dw-roll-attack" data-attack="melee"></button>`;
    const html = $(document.body);
    const actor = {
      system: { abilities: { str: { value: 13, mod: 2 }, dex: { value: 11, mod: 0 } } }
    } as Actor;

    registerAttackRollListener(html, { actor });

    html.find("[data-action='dw-roll-attack']").trigger("click");
    await flushPromises();

    expect(builtRolls).toEqual([{ formula: "1d20 + @mod", mod: 2 }]);
    expect(getSpeaker).toHaveBeenCalledWith({ actor });
    expect(postedMessage).toHaveBeenCalledTimes(1);
    expect(postedMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        speaker: { alias: "Actor" },
        flavor: expect.stringContaining("Melee Attack")
      })
    );
    expect((postedMessage.mock.calls[0][0] as { flavor: string }).flavor).toContain("(Strength)");
  });
});



