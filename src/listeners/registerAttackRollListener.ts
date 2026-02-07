import { DW_ROLL_ATTACK } from "../constants/templateAttributes.js";
import type { ActionEvent, HtmlRoot } from "../types.js";
import { getDataset } from "../utils/getDataset.js";
import { registerAction } from "../utils/registerAction.js";
import { buildAbilities } from "../utils/buildAbilities.js";

const ATTACK_TO_ABILITY: Record<string, "str" | "dex"> = {
  melee: "str",
  ranged: "dex"
};

const ATTACK_LABELS: Record<string, string> = {
  melee: "Melee Attack",
  ranged: "Ranged Attack"
};

const ABILITY_LABELS: Record<"str" | "dex", string> = {
  str: "Strength",
  dex: "Dexterity"
};

export function registerAttackRollListener(html: HtmlRoot, { actor }: { actor: Actor }): void {
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
      `<span class="dw-roll-title">${ATTACK_LABELS[attackType]}</span>` +
      ` - 1d20 ${sign} <b>${Math.abs(mod)}</b> (${ABILITY_LABELS[abilityKey]})`;

    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor
    });
  });
}