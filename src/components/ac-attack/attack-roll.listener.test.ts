import { afterEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "../../test/flushPromises.js";
import { registerAttackRollListener } from "./attack-roll.listener.js";

describe("registerAttackRollListener", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("delegates melee attack roll to rollAttackCheck with mapped ability mod", async () => {
    const localizeMap: Record<string, string> = {
      "DOLMENWOOD.UI.MeleeAttack": "Melee Attack",
      "DOLMENWOOD.UI.RangedAttack": "Ranged Attack",
      "DOLMENWOOD.Ability.Strength": "Strength",
      "DOLMENWOOD.Ability.Dexterity": "Dexterity"
    };

    vi.stubGlobal("game", {
      i18n: { localize: (key: string) => localizeMap[key] ?? key }
    });

    const rollAttackCheck = vi.fn(async () => ({ roll: {} as Roll, mod: 2 }));

    document.body.innerHTML = `<button data-action="dw-roll-attack" data-attack="melee"></button>`;
    const html = $(document.body);
    const actor = {
      system: { abilities: { str: { value: 13, mod: 2 }, dex: { value: 11, mod: 0 } } }
    } as Actor;

    registerAttackRollListener(html, { actor, rollAttackCheck });

    html.find("[data-action='dw-roll-attack']").trigger("click");
    await flushPromises();

    expect(rollAttackCheck).toHaveBeenCalledTimes(1);
    expect(rollAttackCheck).toHaveBeenCalledWith(actor, "Melee Attack", "Strength", 2);
  });
});
