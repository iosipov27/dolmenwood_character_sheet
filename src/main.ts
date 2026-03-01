import { registerHandlebarsHelpers } from "./utils/handlebars-helpers.js";
import { registerSettings } from "./bootstrap/registerSettings.js";
import { registerTemplates } from "./bootstrap/registerTemplates.js";
import { registerSheet } from "./bootstrap/registerSheet.js";

Hooks.once("init", async (): Promise<void> => {
  registerSettings();
  registerHandlebarsHelpers();
  await registerTemplates();
  registerSheet();
});
