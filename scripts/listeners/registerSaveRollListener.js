import { registerAction } from "../utils/registerAction.js";
import { DW_ROLL_SAVE } from "../constants/templateAttributes.js";

export function registerSaveRollListener(html, { actor, getDwFlags, rollTargetCheck, prettyKey }) {
    registerAction(html, DW_ROLL_SAVE, async (ev) => {
        const key = ev.currentTarget.dataset.key;
        const target = Number(foundry.utils.getProperty(getDwFlags(), `saves.${key}`) ?? 0);

        await rollTargetCheck(actor, `Save: ${prettyKey(key)}`, target);
    });
}
