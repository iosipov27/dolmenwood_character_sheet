import { registerAction } from "../utils/registerAction.js";
import { DW_ROLL_SAVE } from "../constants/templateAttributes.js";
import { getDataset } from "../utils/getDataset.js";
export function registerSaveRollListener(html, { actor, getDwFlags, rollTargetCheck, prettyKey }) {
    registerAction(html, DW_ROLL_SAVE, async (ev) => {
        const { key } = getDataset(ev);
        const target = Number(foundry.utils.getProperty(getDwFlags(), `saves.${key}`) ?? 0);
        await rollTargetCheck(actor, `Save: ${prettyKey(key ?? "")}`, target);
    });
}
//# sourceMappingURL=registerSaveRollListener.js.map