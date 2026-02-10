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

export interface DwMeta {
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
  };
  xp: number;
  level: number;
  nextLevel: number;
  modifier: number;
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

export type ActorSheetConstructor = typeof ActorSheet;

export interface SheetClassConfigLike {
  label?: string;
  cls?: ActorSheetConstructor;
  id?: string;
  namespace?: string;
}

export type JQueryWithOn<T extends HTMLElement = HTMLElement> = JQuery<T> & {
  on(event: string, handler: (ev: ActionEvent<T>) => void): JQuery<T>;
};

export type RollTargetCheck = (
  actor: Actor,
  label: string,
  target: number
) => Promise<{ roll: Roll; success: boolean; target: number }>;

export type RollAbilityCheck = (
  actor: Actor,
  abilityLabel: string,
  abilityValue: number
) => Promise<{ roll: Roll; success: boolean; target: number }>;

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
}

export type BaseSheetData = ReturnType<ActorSheet["getData"]>;

export type DwSheetData = BaseSheetData & {
  system: Record<string, unknown>;
  dw: DwFlags;
  dwSkillsList: DwSkillEntry[];
  dwUi: {
    saveTooltips: Record<string, string>;
    skillTooltips: Record<string, string>;
    prettyKey: Record<string, string>;
    equipment: {
      equippedFields: DwEquipmentFieldEntry[];
      stowedFields: DwEquipmentFieldEntry[];
    };
  };
  dwAbilities: DwAbilityView[];
  dwCombat: DwCombatView;
  dwHp: DwHpView;
  dwSavesList: DwSaveEntry[];
};

declare global {
  interface SettingConfig {
    "dolmenwood.enableDebugLogs": boolean;
    "dolmenwood.enableErrorNotifications": boolean;
  }
}
