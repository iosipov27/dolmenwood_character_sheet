import { buildAbilities } from "../utils/buildAbilities.js";
import { buildCombat } from "../utils/buildCombat.js";
import { buildHp } from "../utils/buildHp.js";
import type { DwSheetData } from "../types/index.js";
import { buildDwData } from "./buildDwData.js";
import { buildDwAbilityItems } from "./buildDwAbilityItems.js";
import { buildDwSavesList } from "./buildDwSavesList.js";
import { buildDwSpellItems } from "./buildDwSpellItems.js";
import { buildDwUi } from "./buildDwUi.js";
import { getDwFormFields } from "./dwSchema.js";
import { buildDwLocalize } from "./localize.js";

export class DolmenwoodSheetData {
  static populate(data: DwSheetData, actor: Actor): DwSheetData {
    const localize = buildDwLocalize();
    const actorSystem = (actor.system as Record<string, unknown>) ?? {};

    // OSE system data.
    data.system = actorSystem;
    data.dw = buildDwData(actor);
    data.view = {
      form: {
        fields: getDwFormFields()
      },
      actor: {
        abilities: buildAbilities(actorSystem),
        combat: buildCombat(actorSystem),
        hp: buildHp(actorSystem)
      },
      lists: {
        saves: buildDwSavesList(data.dw, localize)
      },
      items: {
        spells: buildDwSpellItems(actor),
        abilities: buildDwAbilityItems(actor)
      },
      ui: buildDwUi(data.dw, localize, actor.name)
    };

    return data;
  }
}
