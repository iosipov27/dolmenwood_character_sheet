const MODULE_ROOT = "modules/dolmenwood";
const COMPONENTS_ROOT = `${MODULE_ROOT}/src/components`;
const TEMPLATES_ROOT = `${MODULE_ROOT}/templates`;

const componentTemplate = (name: string): string => `${COMPONENTS_ROOT}/${name}/${name}.hbs`;

const TEMPLATE_PATHS: Record<string, string> = {
  "dolmenwood-main-tab": `${TEMPLATES_ROOT}/dolmenwood-main-tab.hbs`,
  "dolmenwood-second-tab": `${TEMPLATES_ROOT}/dolmenwood-second-tab.hbs`,
  "player-data": componentTemplate("player-data"),
  "health-points": componentTemplate("health-points"),
  "save-throws": componentTemplate("save-throws"),
  "ac-attack": componentTemplate("ac-attack"),
  movement: componentTemplate("movement"),
  abilities: componentTemplate("abilities"),
  "skill-targets": componentTemplate("skill-targets"),
  "kindred-class-traits": componentTemplate("kindred-class-traits"),
  languages: componentTemplate("languages"),
  "xp-section": componentTemplate("xp-section"),
  avatar: componentTemplate("avatar")
};

export async function registerTemplates(): Promise<void> {
  await foundry.applications.handlebars.loadTemplates(TEMPLATE_PATHS);
}
