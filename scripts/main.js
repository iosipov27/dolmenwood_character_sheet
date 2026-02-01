/* dolmenwood | Foundry VTT v13 */
import { MODULE_ID } from "./constants/moduleId.js";
import { DolmenwoodSheet } from "./sheets/dolmenwoodSheet.js";
Hooks.once("init", async () => {
    const templatePaths = {
        "player-data": "modules/dolmenwood/templates/parts/player-data.hbs",
        "health-points": "modules/dolmenwood/templates/parts/health-points.hbs"
    };
    await loadTemplates(templatePaths);
    Actors.registerSheet(MODULE_ID, DolmenwoodSheet, {
        types: ["character"],
        makeDefault: false,
        label: "Dolmenwood Sheet"
    });
});
//# sourceMappingURL=main.js.map