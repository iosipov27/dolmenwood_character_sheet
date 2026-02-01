/* dolmenwood | Foundry VTT v13 */

import { MODULE_ID } from "./constants/moduleId.js";
import { DolmenwoodSheet } from "./sheets/dolmenwoodSheet.js";

Hooks.once("init", async (): Promise<void> => {
  const templatePaths: Record<string, string> = {
    "player-data": "modules/dolmenwood/templates/parts/player-data.hbs",
    "health-points": "modules/dolmenwood/templates/parts/health-points.hbs",
    "save-throws": "modules/dolmenwood/templates/parts/save-throws.hbs",
    "armor-class": "modules/dolmenwood/templates/parts/armor-class.hbs",
    "movement": "modules/dolmenwood/templates/parts/movement.hbs"
  };

  await foundry.applications.handlebars.loadTemplates(templatePaths);

  foundry.documents.collections.Actors.registerSheet(MODULE_ID, DolmenwoodSheet, {
    types: ["character"],
    makeDefault: false,
    label: "Dolmenwood Sheet"
  });
});
