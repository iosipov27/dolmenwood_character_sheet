import { registerAction } from "../utils/registerAction.js";
import { DW_REMOVE_SKILL } from "../constants/templateAttributes.js";
import { getDataset } from "../utils/getDataset.js";
import type {
    ActionEvent,
    GetDwFlags,
    HtmlRoot,
    RenderSheet,
    SetDwFlags
} from "../types.js";

export function registerRemoveSkillListener(
    html: HtmlRoot,
    {
        getDwFlags,
        setDwFlags,
        renderSheet
    }: { getDwFlags: GetDwFlags; setDwFlags: SetDwFlags; renderSheet: RenderSheet }
): void {
    registerAction(html, DW_REMOVE_SKILL, async (ev: ActionEvent) => {
        const { index } = getDataset(ev);
        const skillIndex = Number(index);
        if (!Number.isFinite(skillIndex)) return;

        const dw = getDwFlags();
        dw.extraSkills = Array.isArray(dw.extraSkills) ? dw.extraSkills : [];

        if (skillIndex < 0 || skillIndex >= dw.extraSkills.length) return;

        dw.extraSkills.splice(skillIndex, 1);
        await setDwFlags(dw);
        renderSheet();
    });
}
