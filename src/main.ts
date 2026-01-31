/* dolmenwood | Foundry VTT v13 */

import { MODULE_ID } from "./constants/moduleId.js";
import { DolmenwoodSheet } from "./sheets/dolmenwoodSheet.js";

Hooks.once("init", async (): Promise<void> => {
    const templatePaths: string[] = [
        "modules/dolmenwood/templates/parts/health-points.hbs",
        "modules/dolmenwood/templates/parts/player-data.hbs"
    ];

    await loadTemplates(templatePaths);

    Actors.registerSheet(MODULE_ID, DolmenwoodSheet as unknown as Application.AnyConstructor, {
        types: ["character"],
        makeDefault: false,
        label: "Dolmenwood Sheet"
    });
});
