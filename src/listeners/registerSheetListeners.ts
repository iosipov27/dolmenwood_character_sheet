import {
  registerAbilityRollListener,
  registerAddSkillListener,
  registerAttackRollListener,
  registerEquipmentListener,
  registerExtraSkillRollListener,
  registerRemoveSkillListener,
  registerSaveDblRollListener,
  registerSaveRollListener,
  registerSkillRollListener
} from "../components/index.js";
import { prettyKey } from "../utils/prettyKey.js";
import { RollChecks } from "../sheets/rollChecks.js";
import type { DwFlags, GetDwFlags, HtmlRoot, SetDwFlags } from "../types.js";
import { registerOtherNotesListener } from "../components/other-notes/other-notes.listener.js";

export function registerSheetListeners(
  html: HtmlRoot,
  {
    actor,
    getDwFlags,
    setDwFlags
  }: {
    actor: Actor;
    getDwFlags: GetDwFlags;
    setDwFlags: SetDwFlags;
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
    rollSkillCheck: RollChecks.rollSkillCheck,
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

  registerAttackRollListener(html, {
    actor,
    rollAttackCheck: RollChecks.rollAttackCheck
  });

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
    rollSkillCheck: RollChecks.rollSkillCheck
  });

  registerEquipmentListener(html);

  registerOtherNotesListener(html, {
    getDwFlags,
    setDwFlags: (dw: DwFlags) => setDwFlags(dw)
  });
}
