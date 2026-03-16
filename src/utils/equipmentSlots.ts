import type { DwEquipment, DwEquipmentCompendiumItem } from "../types/index.js";

export const EQUIPPED_SLOT_COUNT = 10;
export const STOWED_SLOT_COUNT = 16;

export type DwEquipmentSlotPrefix = "equipped" | "stowed";
export type DwEquipmentSlotKey = Extract<
  keyof DwEquipment,
  `equipped${number}` | `stowed${number}`
>;
export type DwEquipmentWeightKey = Extract<
  keyof DwEquipment,
  `equippedWeight${number}` | `stowedWeight${number}`
>;
export type DwEquipmentCompendiumKey = Extract<
  keyof DwEquipment,
  `equippedCompendium${number}` | `stowedCompendium${number}`
>;

export interface DwEquipmentSlotRef {
  prefix: DwEquipmentSlotPrefix;
  index: number;
  slotKey: DwEquipmentSlotKey;
}

export function createEmptyDwEquipmentCompendiumItem(): DwEquipmentCompendiumItem {
  return {
    uuid: "",
    name: "",
    type: "",
    weight: ""
  };
}

export function buildEmptyDwEquipment(): DwEquipment {
  const equipment = {
    tinyItems: ""
  } as DwEquipment;

  for (let i = 1; i <= EQUIPPED_SLOT_COUNT; i += 1) {
    equipment[getDwEquipmentSlotKey("equipped", i)] = "";
    equipment[getDwEquipmentWeightKey("equipped", i)] = "";
    equipment[getDwEquipmentCompendiumKey("equipped", i)] = createEmptyDwEquipmentCompendiumItem();
  }

  for (let i = 1; i <= STOWED_SLOT_COUNT; i += 1) {
    equipment[getDwEquipmentSlotKey("stowed", i)] = "";
    equipment[getDwEquipmentWeightKey("stowed", i)] = "";
    equipment[getDwEquipmentCompendiumKey("stowed", i)] = createEmptyDwEquipmentCompendiumItem();
  }

  return equipment;
}

export function getDwEquipmentSlotKey(
  prefix: DwEquipmentSlotPrefix,
  index: number
): DwEquipmentSlotKey {
  return `${prefix}${index}` as DwEquipmentSlotKey;
}

export function getDwEquipmentWeightKey(
  prefix: DwEquipmentSlotPrefix,
  index: number
): DwEquipmentWeightKey {
  return `${prefix}Weight${index}` as DwEquipmentWeightKey;
}

export function getDwEquipmentCompendiumKey(
  prefix: DwEquipmentSlotPrefix,
  index: number
): DwEquipmentCompendiumKey {
  return `${prefix}Compendium${index}` as DwEquipmentCompendiumKey;
}

export function parseDwEquipmentSlotKey(slotKey: string): DwEquipmentSlotRef | null {
  const match = /^(equipped|stowed)(\d+)$/.exec(slotKey.trim());

  if (!match) return null;

  const prefix = match[1] as DwEquipmentSlotPrefix;
  const index = Number.parseInt(match[2], 10);
  const maxIndex = prefix === "equipped" ? EQUIPPED_SLOT_COUNT : STOWED_SLOT_COUNT;

  if (!Number.isInteger(index) || index < 1 || index > maxIndex) return null;

  return {
    prefix,
    index,
    slotKey: getDwEquipmentSlotKey(prefix, index)
  };
}

export function hasDwEquipmentCompendiumItem(
  item: DwEquipmentCompendiumItem | null | undefined
): boolean {
  if (!item) return false;

  return Boolean(String(item.uuid ?? "").trim() || String(item.name ?? "").trim());
}
