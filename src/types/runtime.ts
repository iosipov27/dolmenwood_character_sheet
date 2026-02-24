import type { DwFlags } from "./dw.js";

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
