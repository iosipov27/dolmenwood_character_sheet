import {
  registerAbilityRollListener,
  registerAddSkillListener,
  registerAttackRollListener,
  registerExtraSkillRollListener,
  registerInputUpdateListeners,
  registerKindredTraitsListener,
  registerLanguagesListener,
  registerRemoveSkillListener,
  registerSaveDblRollListener,
  registerSaveRollListener,
  registerSkillRollListener
} from "../components/index.js";
import { prettyKey } from "../utils/prettyKey.js";
import { RollChecks } from "../sheets/rollChecks.js";
import type { DwFlags, GetDwFlags, HtmlRoot, SetDwFlags } from "../types.js";

export function registerSheetListeners(
  html: HtmlRoot,
  {
    actor,
    getDwFlags,
    setDwFlags,
    renderSheet,
    sheet
  }: {
    actor: Actor;
    getDwFlags: GetDwFlags;
    setDwFlags: SetDwFlags;
    renderSheet: () => void;
    sheet: ActorSheet;
  }
): void {
  registerSaveRollListener(html, {
    actor,
    getDwFlags,
    rollTargetCheck: RollChecks.rollTargetCheck,
    prettyKey
  });

  registerSkillRollListener(html, {
    actor,
    getDwFlags,
    rollTargetCheck: RollChecks.rollTargetCheck,
    prettyKey
  });

  registerSaveDblRollListener(html, {
    actor,
    rollTargetCheck: RollChecks.rollTargetCheck,
    prettyKey
  });

  registerAbilityRollListener(html, {
    actor,
    rollAbilityCheck: RollChecks.rollAbilityCheck
  });

  registerAttackRollListener(html, { actor });

  registerAddSkillListener(html, {
    getDwFlags,
    setDwFlags: (dw: DwFlags) => setDwFlags(dw)
  });

  registerRemoveSkillListener(html, {
    getDwFlags,
    setDwFlags: (dw: DwFlags) => setDwFlags(dw)
  });

  registerExtraSkillRollListener(html, {
    actor,
    rollTargetCheck: RollChecks.rollTargetCheck
  });

  registerKindredTraitsListener(html);
  registerLanguagesListener(html);
  registerInputUpdateListeners(html, sheet);
}
