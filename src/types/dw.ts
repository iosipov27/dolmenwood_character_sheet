export interface DwSaves {
  doom: number;
  hold: number;
  spell: number;
  ray: number;
  blast: number;
  magic: number;
}

export interface DwSkills {
  listen: number;
  search: number;
  survival: number;
}

export interface DwExtraSkill {
  name: string;
  target: number;
}

export interface DwMovement {
  speed: number;
  exploring: number;
  overland: number;
}

export interface DwCombat {
  attack: number;
}

export type DwSpellsTraitsView = "cards" | "text" | "both";

export interface DwMeta {
  spellsCollapsed: boolean;
  traitsCollapsed: boolean;
  meleeAttackBonus: number;
  missileAttackBonus: number;
  meleeDamageFormula: string;
  missileDamageFormula: string;
  meleeDamageBonus: number;
  spellsTraitsView: DwSpellsTraitsView;
  kindredClass: string;
  kindredClassTraits: string;
  background: string;
  alignment: string;
  affiliation: string;
  affiliationVisible: boolean;
  moonSign: string;
  moonSignVisible: boolean;
  languages: string;
  equipment: {
    tinyItems: string;
    equipped1: string;
    equipped2: string;
    equipped3: string;
    equipped4: string;
    equipped5: string;
    equipped6: string;
    equipped7: string;
    equipped8: string;
    equipped9: string;
    equipped10: string;
    equippedWeight1: string;
    equippedWeight2: string;
    equippedWeight3: string;
    equippedWeight4: string;
    equippedWeight5: string;
    equippedWeight6: string;
    equippedWeight7: string;
    equippedWeight8: string;
    equippedWeight9: string;
    equippedWeight10: string;
    stowed1: string;
    stowed2: string;
    stowed3: string;
    stowed4: string;
    stowed5: string;
    stowed6: string;
    stowed7: string;
    stowed8: string;
    stowed9: string;
    stowed10: string;
    stowed11: string;
    stowed12: string;
    stowed13: string;
    stowed14: string;
    stowed15: string;
    stowed16: string;
    stowedWeight1: string;
    stowedWeight2: string;
    stowedWeight3: string;
    stowedWeight4: string;
    stowedWeight5: string;
    stowedWeight6: string;
    stowedWeight7: string;
    stowedWeight8: string;
    stowedWeight9: string;
    stowedWeight10: string;
    stowedWeight11: string;
    stowedWeight12: string;
    stowedWeight13: string;
    stowedWeight14: string;
    stowedWeight15: string;
    stowedWeight16: string;
  };
  xp: number;
  level: number;
  nextLevel: number;
  modifier: number;
  coins: {
    copper: number;
    silver: number;
    gold: number;
    pellucidium: number;
  };
  otherNotes: string;
}

export interface DwFlags {
  saves: DwSaves;
  skills: DwSkills;
  extraSkills: DwExtraSkill[];
  movement: DwMovement;
  combat: DwCombat;
  meta: DwMeta;
}

export type DwFlagsInput = Partial<DwFlags> & Record<string, unknown>;
