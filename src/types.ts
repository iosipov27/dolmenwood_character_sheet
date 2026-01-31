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
  background: string;
  alignment: string;
  affiliation: string;
  moonSign: string;
  languages: string;
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
