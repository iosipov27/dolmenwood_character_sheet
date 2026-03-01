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
