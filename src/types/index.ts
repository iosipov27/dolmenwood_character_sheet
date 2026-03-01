export type {
  DwCombatView,
  DwAbilityView,
  DwActorItemEntry,
  DwEquipmentFieldEntry,
  DwFormFields,
  DwHpView,
  DwSaveEntry,
  DwSheetView
} from "./sheetView.js";

export type {
  DwCombat,
  DwExtraSkill,
  DwFlags,
  DwFlagsInput,
  DwMeta,
  DwMovement,
  DwPlayer,
  DwSaves,
  DwSkills,
  DwSpellsTraitsView
} from "./dw.js";

export type { HtmlRoot, ActionEvent, ActionHandler, JQueryWithOn } from "./dom.js";

export type { ActorSheetConstructor, SheetClassConfigLike, BaseSheetData } from "./foundry.js";

export type {
  RollAbilityCheck,
  RollAttackCheck,
  RollModifierPart,
  RollSkillCheck,
  RollTargetCheck
} from "./rolls.js";

export type { GetDwFlags, DwPatch, ApplyDwPatch, RenderSheet } from "./sheetRuntime.js";

export type { DwSheetData } from "./sheetData.js";

declare global {
  interface SettingConfig {
    "yakov-dolmenwood-sheet.enableDebugLogs": boolean;
    "yakov-dolmenwood-sheet.enableErrorNotifications": boolean;
  }
}
