/* dolmenwood | Foundry VTT v13 */

import { MODULE_ID } from "./constants/moduleId.js";
import { DolmenwoodSheet } from "./sheets/dolmenwoodSheet.js";
import { registerHandlebarsHelpers } from "./utils/handlebars-helpers.js";

Hooks.once("init", async (): Promise<void> => {
  registerHandlebarsHelpers();

  const templatePaths: Record<string, string> = {
    "player-data": "modules/dolmenwood/templates/parts/player-data.hbs",
    "health-points": "modules/dolmenwood/templates/parts/health-points.hbs",
    "save-throws": "modules/dolmenwood/templates/parts/save-throws.hbs",
    "ac-attack": "modules/dolmenwood/templates/parts/ac-attack.hbs",
    movement: "modules/dolmenwood/templates/parts/movement.hbs",
    abilities: "modules/dolmenwood/templates/parts/abilities.hbs",
    "skill-targets": "modules/dolmenwood/templates/parts/skill-targets.hbs",
    "kindred-class-traits": "modules/dolmenwood/templates/parts/kindred-class-traits.hbs",
    languages: "modules/dolmenwood/templates/parts/languages.hbs"
  };

  await foundry.applications.handlebars.loadTemplates(templatePaths);

  foundry.documents.collections.Actors.registerSheet(MODULE_ID, DolmenwoodSheet, {
    types: ["character"],
    makeDefault: false,
    label: "Dolmenwood Sheet"
  });
});
