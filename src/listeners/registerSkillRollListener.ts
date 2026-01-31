import { registerAction } from "../utils/registerAction.js";
import { DW_ROLL_SKILL } from "../constants/templateAttributes.js";

export function registerSkillRollListener(html, { actor, getDwFlags, rollTargetCheck, prettyKey }) {
    registerAction(html, DW_ROLL_SKILL, async (ev) => {
        const key = ev.currentTarget.dataset.key;
        const dw = getDwFlags();
        const target = Number(foundry.utils.getProperty(dw, `skills.${key}`) ?? 0);
        await rollTargetCheck(actor, `Skill: ${prettyKey(key)}`, target);
    });
}
