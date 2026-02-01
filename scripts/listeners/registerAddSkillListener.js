import { registerAction } from "../utils/registerAction.js";
import { DW_ADD_SKILL } from "../constants/templateAttributes.js";
export function registerAddSkillListener(html, { getDwFlags, setDwFlags, renderSheet }) {
    registerAction(html, DW_ADD_SKILL, async () => {
        const dw = getDwFlags();
        dw.extraSkills = Array.isArray(dw.extraSkills) ? dw.extraSkills : [];
        if (dw.extraSkills.length >= 10)
            return;
        dw.extraSkills.push({ name: "", target: 0 });
        await setDwFlags(dw);
        renderSheet();
    });
}
//# sourceMappingURL=registerAddSkillListener.js.map