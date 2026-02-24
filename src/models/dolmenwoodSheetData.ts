import { buildAbilities } from "../utils/buildAbilities.js";
import { buildCombat } from "../utils/buildCombat.js";
import { buildHp } from "../utils/buildHp.js";
import type { BaseSheetData, DwSheetData } from "../types/index.js";
import { buildDwData } from "./buildDwData.js";
import { buildDwAbilityItems } from "./buildDwAbilityItems.js";
import { buildDwSavesList } from "./buildDwSavesList.js";
import { buildDwSkillsList } from "./buildDwSkillsList.js";
import { buildDwSpellItems } from "./buildDwSpellItems.js";
import { buildDwUi } from "./buildDwUi.js";
import { getDwFormFields } from "./dwSchema.js";
import { buildDwLocalize } from "./localize.js";

export class DolmenwoodSheetData {
  static populate(data: BaseSheetData, actor: Actor): DwSheetData {
    const sheetData = data as DwSheetData;
    const localize = buildDwLocalize();

    // OSE system data.
    sheetData.system = (actor.system as Record<string, unknown>) ?? {};

    sheetData.dw = buildDwData(actor);
    sheetData.dwFormFields = getDwFormFields();
    sheetData.dwSkillsList = buildDwSkillsList(sheetData.dw, localize);
    sheetData.dwUi = buildDwUi(sheetData.dw, localize);

    // Abilities from OSE system data.
    sheetData.dwAbilities = buildAbilities(actor.system as Record<string, unknown>);

    // AC and Attack (read from OSE system data)
    sheetData.dwCombat = buildCombat(actor.system as Record<string, unknown>);

    // HP from OSE system data.
    sheetData.dwHp = buildHp(actor.system as Record<string, unknown>);

    sheetData.dwSavesList = buildDwSavesList(sheetData.dw, localize);
    sheetData.dwSpellItems = buildDwSpellItems(actor);
    sheetData.dwAbilityItems = buildDwAbilityItems(actor);

    return sheetData;
  }
}
