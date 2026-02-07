const TEMPLATE_PATHS: Record<string, string> = {
  "dolmenwood-main-tab": "modules/dolmenwood/templates/dolmenwood-main-tab.hbs",
  "dolmenwood-second-tab": "modules/dolmenwood/templates/dolmenwood-second-tab.hbs",
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

export async function registerTemplates(): Promise<void> {
  await foundry.applications.handlebars.loadTemplates(TEMPLATE_PATHS);
}
