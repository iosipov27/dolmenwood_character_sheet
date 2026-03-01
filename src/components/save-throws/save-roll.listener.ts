import { registerActions } from "../../utils/registerActions.js";
import { DW_ROLL_SAVE } from "../../constants/templateAttributes.js";
import { getDataset } from "../../utils/getDataset.js";
import type { ActionEvent, GetDwFlags, HtmlRoot, RollTargetCheck } from "../../types.js";

export function registerSaveRollListener(
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
  const localize = (key: string): string => game.i18n?.localize(key) ?? key;

  registerActions(html, {
    [DW_ROLL_SAVE]: async (ev: ActionEvent) => {
      const { key } = getDataset(ev);
      const target = Number(foundry.utils.getProperty(getDwFlags(), `saves.${key}`) ?? 0);

      await rollTargetCheck(
        actor,
        `${localize("DOLMENWOOD.Roll.SavePrefix")}: ${prettyKey(key ?? "")}`,
        target
      );
    }
  });
}
