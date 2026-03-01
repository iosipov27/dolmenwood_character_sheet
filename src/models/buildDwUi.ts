import { SAVE_TOOLTIPS } from "../constants/saveTooltips.js";
import { SKILL_TOOLTIPS } from "../constants/skillTooltips.js";
import type { DwFlags, DwSheetView } from "../types/index.js";
import { buildDwEquipmentUi } from "./buildDwEquipmentUi.js";
import type { DwLocalize } from "./localize.js";
import { localizeRecord } from "./localize.js";

export function buildDwUi(dw: DwFlags, localize: DwLocalize): DwSheetView["ui"] {
  return {
    saveTooltips: localizeRecord(SAVE_TOOLTIPS, localize),
    skillTooltips: localizeRecord(SKILL_TOOLTIPS, localize),
    equipment: buildDwEquipmentUi(dw.meta.equipment)
  };
}
