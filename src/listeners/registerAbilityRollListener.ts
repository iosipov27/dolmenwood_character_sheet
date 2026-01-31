import { registerAction } from "../utils/registerAction.js";
import { DW_ROLL_ABILITY } from "../constants/templateAttributes.js";
import type { ActionEvent, HtmlRoot, RollAbilityCheck } from "../types.js";

export function registerAbilityRollListener(
    html: HtmlRoot,
    { actor, rollAbilityCheck }: { actor: Actor; rollAbilityCheck: RollAbilityCheck }
): void {
    registerAction(html, DW_ROLL_ABILITY, async (ev: ActionEvent) => {
        const label = ev.currentTarget.dataset.label ?? "";
        const target = Number(ev.currentTarget.dataset.target ?? 0);
        await rollAbilityCheck(actor, label, target);
    });
}
