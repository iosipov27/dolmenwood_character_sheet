import { DW_ROLL_ATTACK } from "../../constants/templateAttributes.js";
import { MODULE_ID } from "../../constants/moduleId.js";
import type { ActionEvent, HtmlRoot, RollAttackCheck } from "../../types.js";
import { getDataset } from "../../utils/getDataset.js";
import { registerAction } from "../../utils/registerAction.js";
import { buildAbilities } from "../../utils/buildAbilities.js";

const ATTACK_TO_ABILITY: Record<string, "str" | "dex"> = {
  melee: "str",
  ranged: "dex"
};
const ATTACK_TO_BONUS_PATH: Record<string, string> = {
  melee: "meta.meleeAttackBonus",
  ranged: "meta.missileAttackBonus"
};
const ATTACK_TO_BONUS_INPUT: Record<string, string> = {
  melee: "dw.meta.meleeAttackBonus",
  ranged: "dw.meta.missileAttackBonus"
};

function asFiniteNumber(value: unknown): number {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

export function registerAttackRollListener(
  html: HtmlRoot,
  { actor, rollAttackCheck }: { actor: Actor; rollAttackCheck: RollAttackCheck }
): void {
  const localize = (key: string): string => game.i18n?.localize(key) ?? key;

  const attackLabels: Record<string, string> = {
    melee: localize("DOLMENWOOD.UI.MeleeAttack"),
    ranged: localize("DOLMENWOOD.UI.RangedAttack")
  };

  const abilityLabels: Record<"str" | "dex", string> = {
    str: localize("DOLMENWOOD.Ability.Strength"),
    dex: localize("DOLMENWOOD.Ability.Dexterity")
  };

  registerAction(html, DW_ROLL_ATTACK, async (ev: ActionEvent) => {
    const { attack } = getDataset(ev);
    const attackType = String(attack ?? "")
      .trim()
      .toLowerCase();
    const abilityKey = ATTACK_TO_ABILITY[attackType];
    const attackBonusPath = ATTACK_TO_BONUS_PATH[attackType];
    const attackBonusInputName = ATTACK_TO_BONUS_INPUT[attackType];

    if (!abilityKey || !attackBonusPath || !attackBonusInputName) return;

    const abilities = buildAbilities(actor.system as Record<string, unknown>);
    const ability = abilities.find((entry) => entry.key === abilityKey);
    const abilityMod = asFiniteNumber(ability?.mod);
    const form = ev.currentTarget instanceof HTMLElement ? ev.currentTarget.closest("form") : null;
    const inputValue = form
      ?.querySelector<HTMLInputElement>(`input[name='${attackBonusInputName}']`)
      ?.value;
    const attackBonus =
      typeof inputValue === "string"
        ? asFiniteNumber(inputValue)
        : asFiniteNumber(foundry.utils.getProperty(actor, `flags.${MODULE_ID}.dw.${attackBonusPath}`));
    const mod = abilityMod + attackBonus;

    await rollAttackCheck(actor, attackLabels[attackType], abilityLabels[abilityKey], mod, [
      { value: abilityMod, label: abilityKey.toUpperCase() },
      { value: attackBonus, label: "BONUS" }
    ]);
  });
}
