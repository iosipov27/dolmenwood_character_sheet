import { DW_ROLL_ATTACK } from "../constants/templateAttributes.js";
import type { ActionEvent, HtmlRoot } from "../types.js";
import { getDataset } from "../utils/getDataset.js";
import { registerAction } from "../utils/registerAction.js";
import { buildAbilities } from "../utils/buildAbilities.js";

const ATTACK_TO_ABILITY: Record<string, "str" | "dex"> = {
  melee: "str",
  ranged: "dex"
};

export function registerAttackRollListener(html: HtmlRoot, { actor }: { actor: Actor }): void {
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
    const attackType = String(attack ?? "").trim().toLowerCase();
    const abilityKey = ATTACK_TO_ABILITY[attackType];

    if (!abilityKey) return;

    const abilities = buildAbilities(actor.system as Record<string, unknown>);
    const ability = abilities.find((entry) => entry.key === abilityKey);
    const mod = Number(ability?.mod ?? 0);
    const roll = await new Roll("1d20 + @mod", { mod }).evaluate();
    const sign = mod >= 0 ? "+" : "-";

    const flavor =
      `<span class="dw-roll-title">${attackLabels[attackType]}</span>` +
      ` - 1d20 ${sign} <b>${Math.abs(mod)}</b> (${abilityLabels[abilityKey]})`;

    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor
    });
  });
}
