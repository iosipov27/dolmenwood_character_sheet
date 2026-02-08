import { registerAction } from "../../utils/registerAction.js";
import { DW_ROLL_SKILL } from "../../constants/templateAttributes.js";
import { getDataset } from "../../utils/getDataset.js";
import type { ActionEvent, GetDwFlags, HtmlRoot, RollTargetCheck } from "../../types.js";

export function registerSkillRollListener(
  html: HtmlRoot,
  {
    actor,
    getDwFlags,
    rollTargetCheck,
    prettyKey
  }: {
    actor: Actor;
    getDwFlags: GetDwFlags;
    rollTargetCheck: RollTargetCheck;
    prettyKey: (key: string) => string;
  }
): void {
  registerAction(html, DW_ROLL_SKILL, async (ev: ActionEvent) => {
    const { key } = getDataset(ev);
    const dw = getDwFlags();
    const target = Number(foundry.utils.getProperty(dw, `skills.${key}`) ?? 0);

    await rollTargetCheck(actor, `Skill: ${prettyKey(key ?? "")}`, target);
  });
}

