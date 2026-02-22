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
const ATTACK_TO_DAMAGE_PATH: Record<string, string> = {
  melee: "meta.meleeDamageFormula",
  ranged: "meta.missileDamageFormula"
};
const ATTACK_TO_DAMAGE_INPUT: Record<string, string> = {
  melee: "dw.meta.meleeDamageFormula",
  ranged: "dw.meta.missileDamageFormula"
};

function asFiniteNumber(value: unknown): number {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

function appendNumericModifier(formula: string, modifier: number): string {
  const normalizedFormula = formula.trim();

  if (!normalizedFormula) return "";

  const normalizedModifier = asFiniteNumber(modifier);

  if (!normalizedModifier) return normalizedFormula;

  const sign = normalizedModifier > 0 ? "+" : "-";

  return `${normalizedFormula} ${sign} ${Math.abs(normalizedModifier)}`;
}

function getDamageFormula({
  attackType,
  baseFormula,
  strengthModifier
}: {
  attackType: string;
  baseFormula: string;
  strengthModifier: number;
}): string {
  if (attackType !== "melee") return baseFormula;

  // Melee damage gets only the STR modifier as an automatic bonus.
  return appendNumericModifier(baseFormula, strengthModifier);
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
    const damagePath = ATTACK_TO_DAMAGE_PATH[attackType];
    const damageInputName = ATTACK_TO_DAMAGE_INPUT[attackType];

    if (!abilityKey || !attackBonusPath || !attackBonusInputName || !damagePath || !damageInputName) {
      return;
    }

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
    const damageInput = form?.querySelector<HTMLInputElement>(`input[name='${damageInputName}']`) ?? null;
    const storedDamageFormula = foundry.utils.getProperty(actor, `flags.${MODULE_ID}.dw.${damagePath}`);
    const damageFormula = (
      damageInput
        ? damageInput.value
        : typeof storedDamageFormula === "string"
          ? storedDamageFormula
          : ""
    ).trim();
    const adjustedDamageFormula = getDamageFormula({
      attackType,
      baseFormula: damageFormula,
      strengthModifier: abilityMod
    });
    const mod = abilityMod + attackBonus;

    await rollAttackCheck(actor, attackLabels[attackType], abilityLabels[abilityKey], mod, [
      { value: abilityMod, label: abilityKey.toUpperCase() },
      { value: attackBonus, label: "BONUS" }
    ], adjustedDamageFormula);
  });
}
