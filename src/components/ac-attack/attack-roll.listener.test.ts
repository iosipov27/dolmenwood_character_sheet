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

  it("opens combat bonuses dialog from edit action", async () => {
    const localizeMap: Record<string, string> = {
      "DOLMENWOOD.UI.CombatBonuses": "Combat Bonuses",
      "DOLMENWOOD.UI.MeleeAttackBonus": "Melee Attack Bonus",
      "DOLMENWOOD.UI.MissileAttackBonus": "Missile Attack Bonus",
      "DOLMENWOOD.UI.MeleeDamageBonus": "Melee Damage Bonus",
      "DOLMENWOOD.UI.Done": "Done",
      "DOLMENWOOD.UI.MeleeAttack": "Melee Attack",
      "DOLMENWOOD.UI.RangedAttack": "Ranged Attack",
      "DOLMENWOOD.Ability.Strength": "Strength",
      "DOLMENWOOD.Ability.Dexterity": "Dexterity"
    };

    vi.stubGlobal("game", {
      i18n: { localize: (key: string) => localizeMap[key] ?? key }
    });
    const renderTemplateMock = vi.fn(
      async () =>
        "<form><label>Melee Attack Bonus</label><label>Missile Attack Bonus</label><label>Melee Damage Bonus</label></form>"
    );

    vi.stubGlobal("renderTemplate", renderTemplateMock);

    const render = vi.fn();
    const createDialog = vi.fn();
    const formDataExtended = vi.fn();

    class DialogMock {
      constructor(config: unknown) {
        createDialog(config);
      }

      render(open: boolean): this {
        render(open);

        return this;
      }
    }

    class FormDataExtendedMock {
      object: Record<string, unknown>;

      constructor(form: HTMLFormElement) {
        formDataExtended(form);

        const read = (name: string): number => {
          const input = form.querySelector<HTMLInputElement>(`[name='${name}']`);

          return Number(input?.value ?? 0);
        };

        this.object = {
          flags: {
            "yakov-dolmenwood-sheet": {
              dw: {
                meta: {
                  meleeAttackBonus: read("flags.yakov-dolmenwood-sheet.dw.meta.meleeAttackBonus"),
                  missileAttackBonus: read("flags.yakov-dolmenwood-sheet.dw.meta.missileAttackBonus"),
                  meleeDamageBonus: read("flags.yakov-dolmenwood-sheet.dw.meta.meleeDamageBonus")
                }
              }
            }
          }
        };
      }
    }

    const originalFoundry = globalThis.foundry as Record<string, unknown> | undefined;
    const foundryWithDialog = {
      ...(originalFoundry ?? {}),
      appv1: {
        ...((originalFoundry as { appv1?: Record<string, unknown> } | undefined)?.appv1 ?? {}),
        api: {
          ...((originalFoundry as { appv1?: { api?: Record<string, unknown> } } | undefined)?.appv1
            ?.api ?? {}),
          Dialog: DialogMock
        }
      },
      applications: {
        ...((originalFoundry as { applications?: Record<string, unknown> } | undefined)?.applications ??
          {}),
        ux: {
          ...((originalFoundry as {
            applications?: { ux?: Record<string, unknown> };
          } | undefined)?.applications?.ux ?? {}),
          FormDataExtended: FormDataExtendedMock
        }
      }
    };

    vi.stubGlobal("foundry", foundryWithDialog);

    const rollAttackCheck = vi.fn(async () => ({ roll: {} as Roll, mod: 2 }));
    const updateMock = vi.fn(async () => {});

    document.body.innerHTML = `<button data-action="dw-open-combat-bonuses-dialog"></button>`;
    const html = $(document.body);
    const actor = {
      flags: {
        "yakov-dolmenwood-sheet": {
          dw: {
            meta: {
              meleeAttackBonus: 1,
              missileAttackBonus: 2,
              meleeDamageBonus: 3
            }
          }
        }
      },
      update: updateMock,
      system: { abilities: { str: { value: 13, mod: 2 }, dex: { value: 11, mod: 0 } } }
    } as Actor;

    registerAttackRollListener(html, { actor, rollAttackCheck });

    html.find("[data-action='dw-open-combat-bonuses-dialog']").trigger("click");
    await flushPromises();

    expect(createDialog).toHaveBeenCalledTimes(1);
    expect(renderTemplateMock).toHaveBeenCalledWith(
      "modules/yakov-dolmenwood-sheet/src/components/ac-attack/combat-bonuses-dialog.hbs",
      {
        moduleId: "yakov-dolmenwood-sheet",
        bonuses: {
          meleeAttackBonus: 1,
          missileAttackBonus: 2,
          meleeDamageBonus: 3
        }
      }
    );
    const config = createDialog.mock.calls[0][0] as { title: string; content: string };

    expect(config.title).toBe("Combat Bonuses");
    expect(config.content).toContain("Melee Attack Bonus");
    expect(config.content).toContain("Missile Attack Bonus");
    expect(config.content).toContain("Melee Damage Bonus");
    expect(render).toHaveBeenCalledWith(true);

    const form = document.createElement("form");

    form.innerHTML = `
      <input name="flags.yakov-dolmenwood-sheet.dw.meta.meleeAttackBonus" value="4" />
      <input name="flags.yakov-dolmenwood-sheet.dw.meta.missileAttackBonus" value="5" />
      <input name="flags.yakov-dolmenwood-sheet.dw.meta.meleeDamageBonus" value="6" />
    `;

    const doneCallback = (
      config as {
        buttons: { done?: { callback?: (html: JQuery<HTMLElement>) => void } };
      }
    ).buttons.done?.callback;

    doneCallback?.($(form));
    await flushPromises();

    expect(formDataExtended).toHaveBeenCalledTimes(1);
    expect(updateMock).toHaveBeenCalledWith({
      flags: {
        "yakov-dolmenwood-sheet": {
          dw: {
            meta: {
              meleeAttackBonus: 4,
              missileAttackBonus: 5,
              meleeDamageBonus: 6
            }
          }
        }
      }
    });
  });
});
