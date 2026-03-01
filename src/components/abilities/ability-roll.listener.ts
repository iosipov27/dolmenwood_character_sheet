import { registerActions } from "../../utils/registerActions.js";
import { DW_ROLL_ABILITY } from "../../constants/templateAttributes.js";
import { getDataset } from "../../utils/getDataset.js";
import type { ActionEvent, HtmlRoot, RollAbilityCheck } from "../../types.js";

export function registerAbilityRollListener(
  html: HtmlRoot,
  { actor, rollAbilityCheck }: { actor: Actor; rollAbilityCheck: RollAbilityCheck }
): void {
  registerActions(html, {
    [DW_ROLL_ABILITY]: async (ev: ActionEvent) => {
      const { label, mod } = getDataset(ev);
      const labelText = label ?? "";
      const abilityMod = Number(mod ?? 0);

      await rollAbilityCheck(actor, labelText, abilityMod);
    }
  });
}
