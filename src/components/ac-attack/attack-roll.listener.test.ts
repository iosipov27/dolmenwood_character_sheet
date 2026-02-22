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
    expect(rollAttackCheck).toHaveBeenCalledWith(actor, "Melee Attack", "Strength", 2, [
      { value: 2, label: "STR" },
      { value: 0, label: "BONUS" }
    ], "");
  });

  it("adds stored melee and ranged attack bonuses to the roll modifier", async () => {
    const localizeMap: Record<string, string> = {
      "DOLMENWOOD.UI.MeleeAttack": "Melee Attack",
      "DOLMENWOOD.UI.RangedAttack": "Ranged Attack",
      "DOLMENWOOD.Ability.Strength": "Strength",
      "DOLMENWOOD.Ability.Dexterity": "Dexterity"
    };

    vi.stubGlobal("game", {
      i18n: { localize: (key: string) => localizeMap[key] ?? key }
    });

    const rollAttackCheck = vi.fn(async () => ({ roll: {} as Roll, mod: 0 }));

    document.body.innerHTML = `
      <button data-action="dw-roll-attack" data-attack="melee"></button>
      <button data-action="dw-roll-attack" data-attack="ranged"></button>
    `;
    const html = $(document.body);
    const actor = {
      flags: {
        "yakov-dolmenwood-sheet": {
          dw: {
            meta: {
              meleeAttackBonus: 3,
              missileAttackBonus: 4
            }
          }
        }
      },
      system: { abilities: { str: { value: 13, mod: 2 }, dex: { value: 11, mod: 1 } } }
    } as Actor;

    registerAttackRollListener(html, { actor, rollAttackCheck });

    html.find("[data-action='dw-roll-attack'][data-attack='melee']").trigger("click");
    html.find("[data-action='dw-roll-attack'][data-attack='ranged']").trigger("click");
    await flushPromises();

    expect(rollAttackCheck).toHaveBeenCalledTimes(2);
    expect(rollAttackCheck).toHaveBeenNthCalledWith(1, actor, "Melee Attack", "Strength", 5, [
      { value: 2, label: "STR" },
      { value: 3, label: "BONUS" }
    ], "");
    expect(rollAttackCheck).toHaveBeenNthCalledWith(2, actor, "Ranged Attack", "Dexterity", 5, [
      { value: 1, label: "DEX" },
      { value: 4, label: "BONUS" }
    ], "");
  });

  it("prefers current form input bonus over stored flags for the attack roll", async () => {
    const localizeMap: Record<string, string> = {
      "DOLMENWOOD.UI.MeleeAttack": "Melee Attack",
      "DOLMENWOOD.UI.RangedAttack": "Ranged Attack",
      "DOLMENWOOD.Ability.Strength": "Strength",
      "DOLMENWOOD.Ability.Dexterity": "Dexterity"
    };

    vi.stubGlobal("game", {
      i18n: { localize: (key: string) => localizeMap[key] ?? key }
    });

    const rollAttackCheck = vi.fn(async () => ({ roll: {} as Roll, mod: 0 }));

    document.body.innerHTML = `
      <form>
        <input name="dw.meta.meleeAttackBonus" value="6" />
        <button data-action="dw-roll-attack" data-attack="melee"></button>
      </form>
    `;
    const html = $(document.body);
    const actor = {
      flags: {
        "yakov-dolmenwood-sheet": {
          dw: {
            meta: {
              meleeAttackBonus: 1
            }
          }
        }
      },
      system: { abilities: { str: { value: 13, mod: 2 }, dex: { value: 11, mod: 1 } } }
    } as Actor;

    registerAttackRollListener(html, { actor, rollAttackCheck });

    html.find("[data-action='dw-roll-attack'][data-attack='melee']").trigger("click");
    await flushPromises();

    expect(rollAttackCheck).toHaveBeenCalledTimes(1);
    expect(rollAttackCheck).toHaveBeenCalledWith(actor, "Melee Attack", "Strength", 8, [
      { value: 2, label: "STR" },
      { value: 6, label: "BONUS" }
    ], "");
  });

  it("adds STR modifier to current melee damage formula for attack roll chat action", async () => {
    const localizeMap: Record<string, string> = {
      "DOLMENWOOD.UI.MeleeAttack": "Melee Attack",
      "DOLMENWOOD.UI.RangedAttack": "Ranged Attack",
      "DOLMENWOOD.Ability.Strength": "Strength",
      "DOLMENWOOD.Ability.Dexterity": "Dexterity"
    };

    vi.stubGlobal("game", {
      i18n: { localize: (key: string) => localizeMap[key] ?? key }
    });

    const rollAttackCheck = vi.fn(async () => ({ roll: {} as Roll, mod: 0 }));

    document.body.innerHTML = `
      <form>
        <input name="dw.meta.meleeAttackBonus" value="2" />
        <input name="dw.meta.meleeDamageFormula" value="1d8 + 1" />
        <button data-action="dw-roll-attack" data-attack="melee"></button>
      </form>
    `;
    const html = $(document.body);
    const actor = {
      flags: {
        "yakov-dolmenwood-sheet": {
          dw: {
            meta: {
              meleeAttackBonus: 1,
              meleeDamageFormula: "1d4"
            }
          }
        }
      },
      system: { abilities: { str: { value: 13, mod: 2 }, dex: { value: 11, mod: 1 } } }
    } as Actor;

    registerAttackRollListener(html, { actor, rollAttackCheck });

    html.find("[data-action='dw-roll-attack'][data-attack='melee']").trigger("click");
    await flushPromises();

    expect(rollAttackCheck).toHaveBeenCalledWith(actor, "Melee Attack", "Strength", 4, [
      { value: 2, label: "STR" },
      { value: 2, label: "BONUS" }
    ], "1d8 + 1 + 2");
  });

  it("does not add DEX modifier to ranged damage formula", async () => {
    const localizeMap: Record<string, string> = {
      "DOLMENWOOD.UI.MeleeAttack": "Melee Attack",
      "DOLMENWOOD.UI.RangedAttack": "Ranged Attack",
      "DOLMENWOOD.Ability.Strength": "Strength",
      "DOLMENWOOD.Ability.Dexterity": "Dexterity"
    };

    vi.stubGlobal("game", {
      i18n: { localize: (key: string) => localizeMap[key] ?? key }
    });

    const rollAttackCheck = vi.fn(async () => ({ roll: {} as Roll, mod: 0 }));

    document.body.innerHTML = `
      <form>
        <input name="dw.meta.missileAttackBonus" value="2" />
        <input name="dw.meta.missileDamageFormula" value="1d6" />
        <button data-action="dw-roll-attack" data-attack="ranged"></button>
      </form>
    `;
    const html = $(document.body);
    const actor = {
      system: { abilities: { str: { value: 13, mod: 2 }, dex: { value: 11, mod: 1 } } }
    } as Actor;

    registerAttackRollListener(html, { actor, rollAttackCheck });

    html.find("[data-action='dw-roll-attack'][data-attack='ranged']").trigger("click");
    await flushPromises();

    expect(rollAttackCheck).toHaveBeenCalledWith(actor, "Ranged Attack", "Dexterity", 3, [
      { value: 1, label: "DEX" },
      { value: 2, label: "BONUS" }
    ], "1d6");
  });

  it("does not add melee attack bonus to melee damage formula", async () => {
    const localizeMap: Record<string, string> = {
      "DOLMENWOOD.UI.MeleeAttack": "Melee Attack",
      "DOLMENWOOD.UI.RangedAttack": "Ranged Attack",
      "DOLMENWOOD.Ability.Strength": "Strength",
      "DOLMENWOOD.Ability.Dexterity": "Dexterity"
    };

    vi.stubGlobal("game", {
      i18n: { localize: (key: string) => localizeMap[key] ?? key }
    });

    const rollAttackCheck = vi.fn(async () => ({ roll: {} as Roll, mod: 0 }));

    document.body.innerHTML = `
      <form>
        <input name="dw.meta.meleeAttackBonus" value="4" />
        <input name="dw.meta.meleeDamageFormula" value="1d4" />
        <button data-action="dw-roll-attack" data-attack="melee"></button>
      </form>
    `;
    const html = $(document.body);
    const actor = {
      system: { abilities: { str: { value: 17, mod: 2 }, dex: { value: 11, mod: 0 } } }
    } as Actor;

    registerAttackRollListener(html, { actor, rollAttackCheck });

    html.find("[data-action='dw-roll-attack'][data-attack='melee']").trigger("click");
    await flushPromises();

    expect(rollAttackCheck).toHaveBeenCalledWith(actor, "Melee Attack", "Strength", 6, [
      { value: 2, label: "STR" },
      { value: 4, label: "BONUS" }
    ], "1d4 + 2");
  });
});
