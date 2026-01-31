import { registerAction } from "../utils/registerAction.js";
import { DW_ROLL_ABILITY } from "../constants/templateAttributes.js";

export function registerAbilityRollListener(html, { actor, rollAbilityCheck }) {
    registerAction(html, DW_ROLL_ABILITY, async (ev) => {
        const label = ev.currentTarget.dataset.label ?? "";
        const target = Number(ev.currentTarget.dataset.target ?? 0);
        await rollAbilityCheck(actor, label, target);
    });
}
