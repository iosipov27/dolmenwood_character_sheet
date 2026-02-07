import { registerSaveRollListener } from "./registerSaveRollListener.js";
import { registerSkillRollListener } from "./registerSkillRollListener.js";
import { registerSaveDblRollListener } from "./registerSaveDblRollListener.js";
import { registerSkillDblRollListener } from "./registerSkillDblRollListener.js";
import { registerAbilityRollListener } from "./registerAbilityRollListener.js";
import { registerAttackRollListener } from "./registerAttackRollListener.js";
import { registerAddSkillListener } from "./registerAddSkillListener.js";
import { registerRemoveSkillListener } from "./registerRemoveSkillListener.js";
import { registerExtraSkillRollListener } from "./registerExtraSkillRollListener.js";
import { registerExtraSkillDblRollListener } from "./registerExtraSkillDblRollListener.js";
import { registerKindredTraitsListener } from "./registerKindredTraitsListener.js";
import { registerLanguagesListener } from "./registerLanguagesListener.js";
import { registerInputUpdateListeners } from "./registerInputUpdateListeners.js";
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

  registerSkillDblRollListener(html, {
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
    setDwFlags: (dw: DwFlags) => setDwFlags(dw),
    renderSheet
  });

  registerRemoveSkillListener(html, {
    getDwFlags,
    setDwFlags: (dw: DwFlags) => setDwFlags(dw),
    renderSheet
  });

  registerExtraSkillRollListener(html, {
    actor,
    getDwFlags,
    rollTargetCheck: RollChecks.rollTargetCheck
  });

  registerExtraSkillDblRollListener(html, {
    actor,
    rollTargetCheck: RollChecks.rollTargetCheck
  });

  registerKindredTraitsListener(html);
  registerLanguagesListener(html);
  registerInputUpdateListeners(html, sheet);
}