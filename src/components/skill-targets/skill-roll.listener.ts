import { registerActions } from "../../utils/registerActions.js";
import { DW_ROLL_SKILL } from "../../constants/templateAttributes.js";
import { getDataset } from "../../utils/getDataset.js";
import type { ActionEvent, GetDwFlags, HtmlRoot, RollSkillCheck } from "../../types/index.js";

export function registerSkillRollListener(
  html: HtmlRoot,
  {
    actor,
    getDwFlags,
    rollSkillCheck,
    prettyKey
  }: {
    actor: Actor;
    getDwFlags: GetDwFlags;
    rollSkillCheck: RollSkillCheck;
    prettyKey: (key: string) => string;
  }
): void {
  const localize = (key: string): string => game.i18n?.localize(key) ?? key;

  registerActions(html, {
    [DW_ROLL_SKILL]: async (ev: ActionEvent) => {
      const { key } = getDataset(ev);
      const dw = getDwFlags();
      const targetRaw = Number(foundry.utils.getProperty(dw, `skills.${key}`) ?? 6);
      const target = Number.isFinite(targetRaw) && targetRaw > 0 ? targetRaw : 6;

      await rollSkillCheck(actor, `${localize("DOLMENWOOD.Roll.SkillPrefix")}: ${prettyKey(key ?? "")}`, target);
    }
  });
}
