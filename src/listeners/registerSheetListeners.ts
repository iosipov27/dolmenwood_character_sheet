import {
  registerAbilityRollListener,
  registerAddSkillListener,
  registerAttackRollListener,
  registerEquipmentListener,
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
import { registerOtherNotesListener } from "../components/other-notes/other-notes.listener.js";

export function registerSheetListeners(
  html: HtmlRoot,
  {
    actor,
    getDwFlags,
    setDwFlags,
    renderSheet: _renderSheet,
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

  registerKindredTraitsListener(html, {
    getDwFlags,
    setDwFlags: (dw: DwFlags) => setDwFlags(dw)
  });
  registerLanguagesListener(html, {
    getDwFlags,
    setDwFlags: (dw: DwFlags) => setDwFlags(dw)
  });
  registerEquipmentListener(html, {
    getDwFlags,
    setDwFlags: (dw: DwFlags) => setDwFlags(dw)
  });
  registerInputUpdateListeners(html, sheet);

  registerOtherNotesListener(html, {
    getDwFlags,
    setDwFlags: (dw: DwFlags) => setDwFlags(dw)
  });
}
