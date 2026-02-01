import { registerAction } from "../utils/registerAction.js";
import { DW_ROLL_ABILITY } from "../constants/templateAttributes.js";
import { getDataset } from "../utils/getDataset.js";
export function registerAbilityRollListener(html, { actor, rollAbilityCheck }) {
    registerAction(html, DW_ROLL_ABILITY, async (ev) => {
        const { label, target } = getDataset(ev);
        const labelText = label ?? "";
        const targetValue = Number(target ?? 0);
        await rollAbilityCheck(actor, labelText, targetValue);
    });
}
//# sourceMappingURL=registerAbilityRollListener.js.map