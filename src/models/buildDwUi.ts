import { SAVE_TOOLTIPS } from "../constants/saveTooltips.js";
import { SKILL_TOOLTIPS } from "../constants/skillTooltips.js";
import type { DwFlags, DwSheetData } from "../types.js";
import { prettyKey } from "../utils/prettyKey.js";
import { buildDwEquipmentUi } from "./buildDwEquipmentUi.js";
import type { DwLocalize } from "./localize.js";
import { localizeRecord } from "./localize.js";

export function buildDwUi(dw: DwFlags, localize: DwLocalize): DwSheetData["dwUi"] {
  const prettyKeyMap = Object.fromEntries(
    Object.keys(dw.skills).map((key) => [key, prettyKey(key)])
  );

  return {
    saveTooltips: localizeRecord(SAVE_TOOLTIPS, localize),
    skillTooltips: localizeRecord(SKILL_TOOLTIPS, localize),
    prettyKey: prettyKeyMap,
    equipment: buildDwEquipmentUi(dw.meta.equipment)
  };
}
