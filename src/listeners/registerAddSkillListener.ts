import { registerAction } from "../utils/registerAction.js";
import { DW_ADD_SKILL } from "../constants/templateAttributes.js";
import type { GetDwFlags, HtmlRoot, RenderSheet, SetDwFlags } from "../types.js";

export function registerAddSkillListener(
  html: HtmlRoot,
  {
    getDwFlags,
    setDwFlags,
    renderSheet
  }: { getDwFlags: GetDwFlags; setDwFlags: SetDwFlags; renderSheet: RenderSheet }
): void {
  registerAction(html, DW_ADD_SKILL, async () => {
    const dw = getDwFlags();

    dw.extraSkills = Array.isArray(dw.extraSkills) ? dw.extraSkills : [];

    if (dw.extraSkills.length >= 10) return;

    dw.extraSkills.push({ name: "", target: 0 });
    await setDwFlags(dw);
    renderSheet();
  });
}
