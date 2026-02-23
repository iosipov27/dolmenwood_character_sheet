import { registerAction } from "../../utils/registerAction.js";
import { DW_ROLL_SAVE } from "../../constants/templateAttributes.js";
import type { ActionEvent, HtmlRoot } from "../../types.js";
import { handleSaveRollAction } from "./save-roll.action.js";

export function registerSaveRollListener(
  html: HtmlRoot,
  { actor }: { actor: Actor }
): void {
  registerAction(html, DW_ROLL_SAVE, async (ev: ActionEvent) => {
    await handleSaveRollAction({ actor, event: ev, target: ev.currentTarget });
  });
}
