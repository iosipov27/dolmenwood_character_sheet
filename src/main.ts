/* dolmenwood | Foundry VTT v13 */

import { MODULE_ID } from "./constants/moduleId.js";
import { DolmenwoodSheet } from "./sheets/dolmenwoodSheet.js";

Hooks.once("init", async (): Promise<void> => {
  const templatePaths: Record<string, string> = {
    "player-data": "modules/dolmenwood/templates/parts/player-data.hbs",
    "health-points": "modules/dolmenwood/templates/parts/health-points.hbs",
    "save-throws": "modules/dolmenwood/templates/parts/save-throws.hbs"
  };

  await loadTemplates(templatePaths);

  Actors.registerSheet(MODULE_ID, DolmenwoodSheet as unknown as Application.AnyConstructor, {
    types: ["character"],
    makeDefault: false,
    label: "Dolmenwood Sheet"
  });
});
