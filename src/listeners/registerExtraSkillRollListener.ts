import { registerAction } from "../utils/registerAction.js";
import { DW_ROLL_EXTRA_SKILL } from "../constants/templateAttributes.js";

export function registerExtraSkillRollListener(html, { actor, getDwFlags, rollTargetCheck }) {
    registerAction(html, DW_ROLL_EXTRA_SKILL, async (ev) => {
        const index = Number(ev.currentTarget.dataset.index);
        const name = String(ev.currentTarget.dataset.name ?? "SKILL").trim() || "SKILL";

        const dw = getDwFlags();
        const arr = Array.isArray(dw.extraSkills) ? dw.extraSkills : [];
        const target = Number(arr[index]?.target ?? 0);

        await rollTargetCheck(actor, `Skill: ${name.toUpperCase()}`, target);
    });
}
