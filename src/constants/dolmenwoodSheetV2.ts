export const TAB_GROUP = "dolmenwood-sheet-tabs";
export const TAB_IDS = ["main", "equipment", "spells-abilities", "details"] as const;
export const VIEW_MODES = ["cards", "text", "both"] as const;
export const TOGGLE_VIEW_MODES = ["cards", "text"] as const;
export const VIEW_CLASS_PREFIX = "dw-spells-abilities--view-";
export const VIEW_CLASSES = VIEW_MODES.map((mode) => `${VIEW_CLASS_PREFIX}${mode}`).join(" ");
export const CARDS_COLLAPSED_LAYOUT_CLASS = "dw-spells-abilities--cards-collapsed";
export const SPELLS_COLLAPSED_LAYOUT_CLASS = "dw-spells-abilities--spells-collapsed";
export const TRAITS_COLLAPSED_LAYOUT_CLASS = "dw-spells-abilities--traits-collapsed";
export const CARDS_ROW_HEIGHT_CSS_VAR = "--dw-cards-row-height";

export const ATTACK_TO_ABILITY: Record<string, "str" | "dex"> = {
  melee: "str",
  ranged: "dex"
};
export const ATTACK_TO_BONUS_PATH: Record<string, string> = {
  melee: "meta.meleeAttackBonus",
  ranged: "meta.missileAttackBonus"
};
export const ATTACK_TO_BONUS_INPUT: Record<string, string> = {
  melee: "dw.meta.meleeAttackBonus",
  ranged: "dw.meta.missileAttackBonus"
};
export const ATTACK_TO_DAMAGE_PATH: Record<string, string> = {
  melee: "meta.meleeDamageFormula",
  ranged: "meta.missileDamageFormula"
};
export const ATTACK_TO_DAMAGE_INPUT: Record<string, string> = {
  melee: "dw.meta.meleeDamageFormula",
  ranged: "dw.meta.missileDamageFormula"
};
