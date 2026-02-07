import { MODULE_ID } from "./constants/moduleId.js";
import {
  ENABLE_DEBUG_LOGS_SETTING,
  ENABLE_ERROR_NOTIFICATIONS_SETTING
} from "./constants/settings.js";
import { DolmenwoodSheet } from "./sheets/dolmenwoodSheet.js";
import { registerHandlebarsHelpers } from "./utils/handlebars-helpers.js";

Hooks.once("init", async (): Promise<void> => {
  const settings = game.settings;

  if (!settings) return;

  settings.register(MODULE_ID, ENABLE_DEBUG_LOGS_SETTING, {
    name: "Enable debug logging",
    hint: "When enabled, module errors are written to the browser console.",
    scope: "client",
    config: true,
    type: Boolean,
    default: false
  });

  settings.register(MODULE_ID, ENABLE_ERROR_NOTIFICATIONS_SETTING, {
    name: "Enable error notifications",
    hint: "When enabled, module errors are shown as UI notifications.",
    scope: "client",
    config: true,
    type: Boolean,
    default: true
  });

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
    languages: "modules/dolmenwood/templates/parts/languages.hbs",
    "xp-section": "modules/dolmenwood/templates/parts/xp-section.hbs",
    avatar: "modules/dolmenwood/templates/parts/avatar.hbs"
  };

  await foundry.applications.handlebars.loadTemplates(templatePaths);

  foundry.documents.collections.Actors.registerSheet(MODULE_ID, DolmenwoodSheet, {
    types: ["character"],
    makeDefault: false,
    label: "Dolmenwood Sheet"
  });
});
