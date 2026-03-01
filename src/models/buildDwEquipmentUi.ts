import type { DwEquipmentFieldEntry, DwMeta, DwSheetView } from "../types/index.js";

type DwEquipmentState = DwMeta["equipment"];

export function buildDwEquipmentUi(equipment: DwEquipmentState): DwSheetView["ui"]["equipment"] {
  const buildEquipmentField = (
    prefix: "equipped" | "stowed",
    index: number
  ): DwEquipmentFieldEntry => {
    const key = `${prefix}${index}` as keyof DwEquipmentState;
    const weightKey = `${prefix}Weight${index}` as keyof DwEquipmentState;
    const value = String(equipment[key] ?? "");
    const weightValue = String(equipment[weightKey] ?? "");

    return {
      id: `dw-${prefix}-${index}`,
      name: `dw.meta.equipment.${prefix}${index}`,
      value,
      placeholder: `Item ${index}`,
      weightId: `dw-${prefix}-weight-${index}`,
      weightName: `dw.meta.equipment.${prefix}Weight${index}`,
      weightValue
    };
  };

  const equippedFields = Array.from({ length: 10 }, (_, i) => buildEquipmentField("equipped", i + 1));
  const stowedFields = Array.from({ length: 16 }, (_, i) => buildEquipmentField("stowed", i + 1));
  const allWeightFields = [...equippedFields, ...stowedFields];
  const totalWeight = allWeightFields
    .map((field) => Number.parseFloat(field.weightValue))
    .filter((weight) => Number.isFinite(weight))
    .reduce((sum, weight) => sum + weight, 0);
  const formattedTotalWeight = Number.isInteger(totalWeight)
    ? String(totalWeight)
    : String(Number(totalWeight.toFixed(2)));

  return {
    equippedFields,
    stowedFields,
    totalWeight: formattedTotalWeight
  };
}
