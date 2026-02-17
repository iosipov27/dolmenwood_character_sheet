import {
  DW_OPEN_COMBAT_BONUSES_DIALOG,
  DW_ROLL_ATTACK
} from "../../constants/templateAttributes.js";
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
const COMBAT_BONUSES_DIALOG_TEMPLATE = `modules/${MODULE_ID}/src/components/ac-attack/combat-bonuses-dialog.hbs`;

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

  registerAction(html, DW_OPEN_COMBAT_BONUSES_DIALOG, async () => {
    const dw = (foundry.utils.getProperty(actor, `flags.${MODULE_ID}.dw`) ?? {}) as Record<
      string,
      unknown
    >;
    const bonuses = {
      meleeAttackBonus: asFiniteNumber(foundry.utils.getProperty(dw, "meta.meleeAttackBonus")),
      missileAttackBonus: asFiniteNumber(foundry.utils.getProperty(dw, "meta.missileAttackBonus")),
      meleeDamageBonus: asFiniteNumber(foundry.utils.getProperty(dw, "meta.meleeDamageBonus"))
    };
    const content = await renderTemplate(COMBAT_BONUSES_DIALOG_TEMPLATE, { moduleId: MODULE_ID, bonuses });

    await foundry.applications.api.DialogV2.prompt({
      window: { title: localize("DOLMENWOOD.UI.CombatBonuses") },
      content,
      modal: true,
      rejectClose: false,
      ok: {
        label: localize("DOLMENWOOD.UI.Done"),
        callback: (_event: PointerEvent | SubmitEvent, button: HTMLButtonElement) => {
          const form = button.form;

          if (!(form instanceof HTMLFormElement)) return null;

          const formData = new foundry.applications.ux.FormDataExtended(form);
          const updateData = formData.object as Record<string, unknown>;
          const updatePathBase = `flags.${MODULE_ID}.dw.meta`;

          foundry.utils.setProperty(
            updateData,
            `${updatePathBase}.meleeAttackBonus`,
            asFiniteNumber(foundry.utils.getProperty(updateData, `${updatePathBase}.meleeAttackBonus`))
          );
          foundry.utils.setProperty(
            updateData,
            `${updatePathBase}.missileAttackBonus`,
            asFiniteNumber(foundry.utils.getProperty(updateData, `${updatePathBase}.missileAttackBonus`))
          );
          foundry.utils.setProperty(
            updateData,
            `${updatePathBase}.meleeDamageBonus`,
            asFiniteNumber(foundry.utils.getProperty(updateData, `${updatePathBase}.meleeDamageBonus`))
          );

          void actor.update(updateData);
          return true;
        }
      }
    });
  });

  registerAction(html, DW_ROLL_ATTACK, async (ev: ActionEvent) => {
    const { attack } = getDataset(ev);
    const attackType = String(attack ?? "")
      .trim()
      .toLowerCase();
    const abilityKey = ATTACK_TO_ABILITY[attackType];
    const attackBonusPath = ATTACK_TO_BONUS_PATH[attackType];

    if (!abilityKey || !attackBonusPath) return;

    const abilities = buildAbilities(actor.system as Record<string, unknown>);
    const ability = abilities.find((entry) => entry.key === abilityKey);
    const abilityMod = asFiniteNumber(ability?.mod);
    const attackBonus = asFiniteNumber(
      foundry.utils.getProperty(actor, `flags.${MODULE_ID}.dw.${attackBonusPath}`)
    );
    const mod = abilityMod + attackBonus;

    await rollAttackCheck(actor, attackLabels[attackType], abilityLabels[abilityKey], mod, [
      { value: abilityMod, label: abilityKey.toUpperCase() },
      { value: attackBonus, label: "BONUS" }
    ]);
  });
}
