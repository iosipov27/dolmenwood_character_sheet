import { buildAbilities } from "../utils/buildAbilities.js";
import { buildCombat } from "../utils/buildCombat.js";
import { buildHp } from "../utils/buildHp.js";
import type { DwSheetData } from "../types.js";
import { buildDwData } from "./buildDwData.js";
import { buildDwAbilityItems } from "./buildDwAbilityItems.js";
import { buildDwSavesList } from "./buildDwSavesList.js";
import { buildDwSkillsList } from "./buildDwSkillsList.js";
import { buildDwSpellItems } from "./buildDwSpellItems.js";
import { buildDwUi } from "./buildDwUi.js";
import { getDwFormFields } from "./dwSchema.js";
import { buildDwLocalize } from "./localize.js";

export class DolmenwoodSheetData {
  static populate(data: DwSheetData, actor: Actor): DwSheetData {
    const localize = buildDwLocalize();

    // OSE system data.
    data.system = (actor.system as Record<string, unknown>) ?? {};

    data.dw = buildDwData(actor);
    data.dwFormFields = getDwFormFields();
    data.dwSkillsList = buildDwSkillsList(data.dw, localize);
    data.dwUi = buildDwUi(data.dw, localize);

    // Abilities from OSE system data.
    data.dwAbilities = buildAbilities(actor.system as Record<string, unknown>);

    // AC and Attack (read from OSE system data)
    data.dwCombat = buildCombat(actor.system as Record<string, unknown>);

    // HP from OSE system data.
    data.dwHp = buildHp(actor.system as Record<string, unknown>);

    data.dwSavesList = buildDwSavesList(data.dw, localize);
    data.dwSpellItems = buildDwSpellItems(actor);
    data.dwAbilityItems = buildDwAbilityItems(actor);

    return data;
  }
}
