import {
  registerAbilityRollListener,
  registerAddSkillListener,
  registerAttackRollListener,
  registerEquipmentListener,
  registerExtraSkillRollListener,
  registerRemoveSkillListener,
  registerSaveRollListener,
  registerSkillRollListener,
  registerSpellsListener,
  registerSpellsTraitsViewListener
} from "../components/index.js";
import { registerAttackDamageRollChatListener } from "./registerAttackDamageRollChatListener.js";
import { prettyKey } from "../utils/prettyKey.js";
import { RollChecks } from "../sheets/rollChecks.js";
import type { ApplyDwPatch, GetDwFlags, HtmlRoot } from "../types.js";

export function registerSheetListeners(
  html: HtmlRoot,
  {
    actor,
    getDwFlags,
    applyDwPatch
  }: {
    actor: Actor;
    getDwFlags: GetDwFlags;
    applyDwPatch: ApplyDwPatch;
  }
): void {
  registerAttackDamageRollChatListener();

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
    applyDwPatch: (dwPatch) => applyDwPatch(dwPatch)
  });

  registerRemoveSkillListener(html, {
    getDwFlags,
    applyDwPatch: (dwPatch) => applyDwPatch(dwPatch)
  });

  registerExtraSkillRollListener(html, {
    actor,
    rollSkillCheck: RollChecks.rollSkillCheck
  });

  registerSpellsListener(html, {
    actor,
    getDwFlags,
    applyDwPatch: (dwPatch) => applyDwPatch(dwPatch)
  });
  registerSpellsTraitsViewListener(html, {
    getDwFlags,
    applyDwPatch: (dwPatch) => applyDwPatch(dwPatch)
  });

  registerEquipmentListener(html);
}
