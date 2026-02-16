import { MODULE_ID } from "../constants/moduleId.js";

const MODULE_ROOT = `modules/${MODULE_ID}`;
const COMPONENTS_ROOT = `${MODULE_ROOT}/src/components`;
const TEMPLATES_ROOT = `${MODULE_ROOT}/templates`;

const componentTemplate = (name: string): string => `${COMPONENTS_ROOT}/${name}/${name}.hbs`;

const TAB_TEMPLATES = [
  "dolmenwood-main-tab",
  "dolmenwood-details-tab",
  "dolmenwood-equipment-tab",
  "dolmenwood-spells-abilities-tab"
];

const COMPONENT_TEMPLATES = [
  "player-data",
  "health-points",
  "save-throws",
  "ac-attack",
  "movement",
  "abilities",
  "skill-targets",
  "kindred-class-traits",
  "languages",
  "equipment",
  "xp-section",
  "avatar",
  "other-notes",
  "spells",
  "ability-items"
];

const TEMPLATE_PATHS: Record<string, string> = {
  ...Object.fromEntries(TAB_TEMPLATES.map((name) => [name, `${TEMPLATES_ROOT}/${name}.hbs`])),
  ...Object.fromEntries(COMPONENT_TEMPLATES.map((name) => [name, componentTemplate(name)]))
};

export async function registerTemplates(): Promise<void> {
  await foundry.applications.handlebars.loadTemplates(TEMPLATE_PATHS);
}
