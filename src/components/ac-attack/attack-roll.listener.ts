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

    new foundry.appv1.api.Dialog({
      title: localize("DOLMENWOOD.UI.CombatBonuses"),
      content,
      buttons: {
        done: {
          label: localize("DOLMENWOOD.UI.Done"),
          callback: (dialogHtml) => {
            const root = dialogHtml instanceof HTMLElement ? dialogHtml : dialogHtml.get(0);
            const form =
              root instanceof HTMLFormElement
                ? root
                : root instanceof HTMLElement
                  ? root.querySelector("form")
                  : null;

            if (!(form instanceof HTMLFormElement)) return;

            const formData = new foundry.applications.ux.FormDataExtended(form);
            const updateData = formData.object as Record<string, unknown>;

            void actor.update(updateData);
          }
        }
      },
      default: "done"
    }).render(true);
  });

  registerAction(html, DW_ROLL_ATTACK, async (ev: ActionEvent) => {
    const { attack } = getDataset(ev);
    const attackType = String(attack ?? "")
      .trim()
      .toLowerCase();
    const abilityKey = ATTACK_TO_ABILITY[attackType];

    if (!abilityKey) return;

    const abilities = buildAbilities(actor.system as Record<string, unknown>);
    const ability = abilities.find((entry) => entry.key === abilityKey);
    const mod = Number(ability?.mod ?? 0);

    await rollAttackCheck(actor, attackLabels[attackType], abilityLabels[abilityKey], mod);
  });
}
