/* dolmenwood | Foundry VTT v13 */

import { MODULE_ID } from "./constants/moduleId.js";
import { DolmenwoodSheet } from "./sheets/dolmenwoodSheet.js";

Hooks.once("init", async () => {
    await loadTemplates([
        "modules/dolmenwood/templates/parts/health-points.hbs",
        "modules/dolmenwood/templates/parts/player-data.hbs"
    ]);

    Actors.registerSheet(MODULE_ID, DolmenwoodSheet, {
        types: ["character"],
        makeDefault: false,
        label: "Dolmenwood Sheet"
    });
});
