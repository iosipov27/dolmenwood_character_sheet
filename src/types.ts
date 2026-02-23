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
  moonSign: string;
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

export interface DwAbilityView {
  key: string;
  label: string;
  value: number;
  name: string;
  hasPath: boolean;
  mod: number;
  hasMod: boolean;
  modText: string;
  title: string;
}

export interface DwCombatView {
  ac: number | null;
  attack: number | null;
  nameAc: string;
  nameAttack: string;
  hasAc: boolean;
  hasAttack: boolean;
}

export interface DwHpView {
  current: number | null;
  max: number | null;
  nameCurrent: string;
  nameMax: string;
  hasCurrent: boolean;
  hasMax: boolean;
}

export type HtmlRoot = JQuery<HTMLElement>;

export type ActionEvent<T extends HTMLElement = HTMLElement> = Event & {
  currentTarget: T;
  preventDefault(): void;
};

export type ActionHandler<T extends HTMLElement = HTMLElement> = (
  event: ActionEvent<T>
) => void | Promise<void>;

export type JQueryWithOn<T extends HTMLElement = HTMLElement> = JQuery<T> & {
  on(event: string, handler: (ev: ActionEvent<T>) => void): JQuery<T>;
};

export type RollTargetCheck = (
  actor: Actor,
  label: string,
  target: number
) => Promise<{ roll: Roll; success: boolean; target: number } | null>;

export type RollAbilityCheck = (
  actor: Actor,
  abilityLabel: string,
  abilityMod: number
) => Promise<{ roll: Roll; success: boolean; target: number } | null>;

export type RollSkillCheck = (
  actor: Actor,
  label: string,
  skillValue: number
) => Promise<{ roll: Roll; success: boolean; target: number } | null>;

export type RollAttackCheck = (
  actor: Actor,
  attackLabel: string,
  abilityLabel: string,
  abilityMod: number,
  modifierParts?: RollModifierPart[],
  damageFormula?: string
) => Promise<{ roll: Roll; mod: number } | null>;

export interface RollModifierPart {
  value: number;
  label: string;
}

export type GetDwFlags = () => DwFlags;
export type SetDwFlags = (dw: DwFlags) => Promise<void> | void;
export type RenderSheet = () => void;

export type DwSkillEntry =
  | { kind: "fixed"; key: string; label: string; value: number }
  | { kind: "extra"; index: number; name: string; target: number };

export interface DwSaveEntry {
  key: string;
  label: string;
  rollable: boolean;
  value: number;
}

export interface DwEquipmentFieldEntry {
  id: string;
  name: string;
  value: string;
  placeholder: string;
  weightId: string;
  weightName: string;
  weightValue: string;
}

export interface DwActorItemEntry {
  id: string;
  name: string;
  img: string;
}

export interface DwFormFields {
  meta: {
    kindredClassTraits: foundry.data.fields.DataField.Any;
    otherNotes: foundry.data.fields.DataField.Any;
  };
}

export type BaseSheetData = ReturnType<ActorSheet["getData"]>;

export type DwSheetData = BaseSheetData & {
  system: Record<string, unknown>;
  dw: DwFlags;
  dwFormFields: DwFormFields | null;
  dwSkillsList: DwSkillEntry[];
  dwUi: {
    saveTooltips: Record<string, string>;
    skillTooltips: Record<string, string>;
    prettyKey: Record<string, string>;
    equipment: {
      equippedFields: DwEquipmentFieldEntry[];
      stowedFields: DwEquipmentFieldEntry[];
      totalWeight: string;
    };
  };
  dwAbilities: DwAbilityView[];
  dwCombat: DwCombatView;
  dwHp: DwHpView;
  dwSavesList: DwSaveEntry[];
  dwSpellItems: DwActorItemEntry[];
  dwAbilityItems: DwActorItemEntry[];
};

declare global {
  interface SettingConfig {
    "yakov-dolmenwood-sheet.enableDebugLogs": boolean;
    "yakov-dolmenwood-sheet.enableErrorNotifications": boolean;
  }
}
