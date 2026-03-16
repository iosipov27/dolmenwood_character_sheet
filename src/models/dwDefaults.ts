import type { DwFlags } from "../types/index.js";
import { getDwSchemaInitialData } from "./dwSchema.js";
import { reportError } from "../utils/reportError.js";
import { buildEmptyDwEquipment } from "../utils/equipmentSlots.js";

const FALLBACK_DW_DEFAULTS: DwFlags = {
  saves: {
    doom: 0,
    hold: 0,
    spell: 0,
    ray: 0,
    blast: 0,
    magic: 0
  },
  skills: { listen: 6, search: 6, survival: 6 },
  extraSkills: [],
  movement: {
    speed: 0,
    exploring: 0,
    overland: 0
  },
  combat: {
    attack: 0
  },
  player: {
    kindredClass: "",
    background: "",
    alignment: "",
    affiliation: "",
    affiliationVisible: true,
    moonSign: "",
    moonSignVisible: true
  },
  meta: {
    spellsCollapsed: false,
    traitsCollapsed: false,
    meleeAttackBonus: 0,
    missileAttackBonus: 0,
    meleeDamageFormula: "",
    missileDamageFormula: "",
    meleeDamageBonus: 0,
    spellsTraitsView: "both",
    kindredClassTraits: "",
    languages: "",
    equipment: buildEmptyDwEquipment(),
    xp: 0,
    level: 1,
    nextLevel: 0,
    modifier: 0,
    coins: {
      copper: 0,
      silver: 0,
      gold: 0,
      pellucidium: 0
    },
    otherNotes: ""
  }
};

function cloneDefaults(): DwFlags {
  try {
    return foundry.utils.duplicate(FALLBACK_DW_DEFAULTS) as DwFlags;
  } catch {
    return structuredClone(FALLBACK_DW_DEFAULTS) as DwFlags;
  }
}

export function dwDefaults(): DwFlags {
  try {
    const schemaDefaults = getDwSchemaInitialData();

    if (schemaDefaults) return schemaDefaults;
  } catch (error) {
    reportError(
      "Failed to read defaults from DW field schema. Falling back to static defaults.",
      error
    );
  }

  return cloneDefaults();
}
