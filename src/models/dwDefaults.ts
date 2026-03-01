import type { DwFlags } from "../types.js";
import { getDwSchemaInitialData } from "./dwSchema.js";
import { reportError } from "../utils/reportError.js";

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
  meta: {
    spellsCollapsed: false,
    traitsCollapsed: false,
    meleeAttackBonus: 0,
    missileAttackBonus: 0,
    meleeDamageFormula: "",
    missileDamageFormula: "",
    meleeDamageBonus: 0,
    spellsTraitsView: "both",
    kindredClass: "",
    kindredClassTraits: "",
    background: "",
    alignment: "",
    affiliation: "",
    moonSign: "",
    languages: "",
    equipment: {
      tinyItems: "",
      equipped1: "",
      equipped2: "",
      equipped3: "",
      equipped4: "",
      equipped5: "",
      equipped6: "",
      equipped7: "",
      equipped8: "",
      equipped9: "",
      equipped10: "",
      equippedWeight1: "",
      equippedWeight2: "",
      equippedWeight3: "",
      equippedWeight4: "",
      equippedWeight5: "",
      equippedWeight6: "",
      equippedWeight7: "",
      equippedWeight8: "",
      equippedWeight9: "",
      equippedWeight10: "",
      stowed1: "",
      stowed2: "",
      stowed3: "",
      stowed4: "",
      stowed5: "",
      stowed6: "",
      stowed7: "",
      stowed8: "",
      stowed9: "",
      stowed10: "",
      stowed11: "",
      stowed12: "",
      stowed13: "",
      stowed14: "",
      stowed15: "",
      stowed16: "",
      stowedWeight1: "",
      stowedWeight2: "",
      stowedWeight3: "",
      stowedWeight4: "",
      stowedWeight5: "",
      stowedWeight6: "",
      stowedWeight7: "",
      stowedWeight8: "",
      stowedWeight9: "",
      stowedWeight10: "",
      stowedWeight11: "",
      stowedWeight12: "",
      stowedWeight13: "",
      stowedWeight14: "",
      stowedWeight15: "",
      stowedWeight16: ""
    },
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
    reportError("Failed to read defaults from DW field schema. Falling back to static defaults.", error);
  }

  return cloneDefaults();
}
