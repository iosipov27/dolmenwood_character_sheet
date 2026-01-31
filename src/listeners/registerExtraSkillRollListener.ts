import { registerAction } from "../utils/registerAction.js";
import { DW_ROLL_EXTRA_SKILL } from "../constants/templateAttributes.js";
import { getDataset } from "../utils/getDataset.js";
import type { ActionEvent, GetDwFlags, HtmlRoot, RollTargetCheck } from "../types.js";

export function registerExtraSkillRollListener(
    html: HtmlRoot,
    {
        actor,
        getDwFlags,
        rollTargetCheck
    }: { actor: Actor; getDwFlags: GetDwFlags; rollTargetCheck: RollTargetCheck }
): void {
    registerAction(html, DW_ROLL_EXTRA_SKILL, async (ev: ActionEvent) => {
        const { index, name } = getDataset(ev);
        const skillIndex = Number(index);
        const skillName = String(name ?? "SKILL").trim() || "SKILL";

        const dw = getDwFlags();
        const arr = Array.isArray(dw.extraSkills) ? dw.extraSkills : [];
        const target = Number(arr[skillIndex]?.target ?? 0);

        await rollTargetCheck(actor, `Skill: ${skillName.toUpperCase()}`, target);
    });
}
