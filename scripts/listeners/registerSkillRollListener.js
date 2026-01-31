import { registerAction } from "../utils/registerAction.js";
import { DW_ROLL_SKILL } from "../constants/templateAttributes.js";
import { getDataset } from "../utils/getDataset.js";
export function registerSkillRollListener(html, { actor, getDwFlags, rollTargetCheck, prettyKey }) {
  registerAction(html, DW_ROLL_SKILL, async (ev) => {
    const { key } = getDataset(ev);
    const dw = getDwFlags();
    const target = Number(foundry.utils.getProperty(dw, `skills.${key}`) ?? 0);
    await rollTargetCheck(actor, `Skill: ${prettyKey(key ?? "")}`, target);
  });
}
//# sourceMappingURL=registerSkillRollListener.js.map
