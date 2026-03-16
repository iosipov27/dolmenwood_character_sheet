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

export interface DwPlayer {
  kindredClass: string;
  background: string;
  alignment: string;
  affiliation: string;
  affiliationVisible: boolean;
  moonSign: string;
  moonSignVisible: boolean;
}

export interface DwEquipmentCompendiumItem {
  uuid: string;
  name: string;
  type: string;
  weight: string;
}

type DwEquippedSlotIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
type DwStowedSlotIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16;
type DwEquipmentTextFieldKey =
  | `equipped${DwEquippedSlotIndex}`
  | `equippedWeight${DwEquippedSlotIndex}`
  | `stowed${DwStowedSlotIndex}`
  | `stowedWeight${DwStowedSlotIndex}`;
type DwEquipmentCompendiumFieldKey =
  | `equippedCompendium${DwEquippedSlotIndex}`
  | `stowedCompendium${DwStowedSlotIndex}`;

export type DwEquipment = {
  tinyItems: string;
} & Record<DwEquipmentTextFieldKey, string> &
  Record<DwEquipmentCompendiumFieldKey, DwEquipmentCompendiumItem>;

export interface DwMeta {
  spellsCollapsed: boolean;
  traitsCollapsed: boolean;
  meleeAttackBonus: number;
  missileAttackBonus: number;
  meleeDamageFormula: string;
  missileDamageFormula: string;
  meleeDamageBonus: number;
  spellsTraitsView: DwSpellsTraitsView;
  kindredClassTraits: string;
  languages: string;
  equipment: DwEquipment;
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
  player: DwPlayer;
  meta: DwMeta;
}

export type DwFlagsInput = Partial<DwFlags> & Record<string, unknown>;
