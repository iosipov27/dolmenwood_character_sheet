import { registerAction } from "../utils/registerAction.js";
import { DW_REMOVE_SKILL } from "../constants/templateAttributes.js";
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
        const index = Number(ev.currentTarget.dataset.index);
        if (!Number.isFinite(index)) return;

        const dw = getDwFlags();
        dw.extraSkills = Array.isArray(dw.extraSkills) ? dw.extraSkills : [];

        if (index < 0 || index >= dw.extraSkills.length) return;

        dw.extraSkills.splice(index, 1);
        await setDwFlags(dw);
        renderSheet();
    });
}
