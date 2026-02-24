import type { DwFlags } from "./dw.js";

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

export interface DwSheetUi {
  saveTooltips: Record<string, string>;
  skillTooltips: Record<string, string>;
  equipment: {
    equippedFields: DwEquipmentFieldEntry[];
    stowedFields: DwEquipmentFieldEntry[];
    totalWeight: string;
  };
}

export interface DwSheetViews {
  dwAbilities: DwAbilityView[];
  dwCombat: DwCombatView;
  dwHp: DwHpView;
}

export interface DwSheetCollections {
  dwSkillsList: DwSkillEntry[];
  dwSavesList: DwSaveEntry[];
  dwSpellItems: DwActorItemEntry[];
  dwAbilityItems: DwActorItemEntry[];
}

export interface DwSheetFormState {
  dwFormFields: DwFormFields | null;
}

export type DwSheetData = BaseSheetData &
  DwSheetViews &
  DwSheetCollections &
  DwSheetFormState & {
    system: Record<string, unknown>;
    dw: DwFlags;
    dwUi: DwSheetUi;
  };
