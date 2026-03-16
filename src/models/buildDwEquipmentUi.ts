import type { DwEquipmentFieldEntry, DwMeta, DwSheetView } from "../types/index.js";
import {
  EQUIPPED_SLOT_COUNT,
  STOWED_SLOT_COUNT,
  getDwEquipmentCompendiumKey,
  getDwEquipmentSlotKey,
  getDwEquipmentWeightKey,
  hasDwEquipmentCompendiumItem
} from "../utils/equipmentSlots.js";
import {
  buildDwEncumbranceSummary,
  formatDwLoad,
  sumDwLoadValues
} from "../utils/encumbrance.js";

type DwEquipmentState = DwMeta["equipment"];
type DwCoinsState = DwMeta["coins"];

export function buildDwEquipmentUi(
  equipment: DwEquipmentState,
  coins: DwCoinsState
): DwSheetView["ui"]["equipment"] {
  const buildEquipmentField = (
    prefix: "equipped" | "stowed",
    index: number
  ): DwEquipmentFieldEntry => {
    const key = getDwEquipmentSlotKey(prefix, index);
    const weightKey = getDwEquipmentWeightKey(prefix, index);
    const compendiumKey = getDwEquipmentCompendiumKey(prefix, index);
    const compendiumItem = equipment[compendiumKey];
    const isCompendiumItem = hasDwEquipmentCompendiumItem(compendiumItem);
    const valueSource = isCompendiumItem ? compendiumItem.name : equipment[key];
    const weightSource =
      equipment[weightKey] || (isCompendiumItem ? compendiumItem.weight : equipment[weightKey]);
    const value = String(valueSource ?? "");
    const weightValue = String(weightSource ?? "");

    return {
      id: `dw-${prefix}-${index}`,
      name: `dw.meta.equipment.${prefix}${index}`,
      value,
      placeholder: `Item ${index}`,
      slotKey: key,
      isCompendiumItem,
      compendiumItem: isCompendiumItem
        ? {
            uuid: String(compendiumItem.uuid ?? ""),
            name: value,
            weight: weightValue
          }
        : null,
      weightId: `dw-${prefix}-weight-${index}`,
      weightName: `dw.meta.equipment.${prefix}Weight${index}`,
      weightValue
    };
  };

  const equippedFields = Array.from({ length: EQUIPPED_SLOT_COUNT }, (_, i) =>
    buildEquipmentField("equipped", i + 1)
  );
  const stowedFields = Array.from({ length: STOWED_SLOT_COUNT }, (_, i) =>
    buildEquipmentField("stowed", i + 1)
  );
  const allWeightFields = [...equippedFields, ...stowedFields];
  const totalWeight = sumDwLoadValues(allWeightFields.map((field) => field.weightValue));
  const totalCoinWeight = sumDwLoadValues(Object.values(coins));
  const encumbrance = buildDwEncumbranceSummary(totalWeight + totalCoinWeight);

  return {
    equippedFields,
    stowedFields,
    totalWeight: formatDwLoad(totalWeight),
    encumbrance: {
      current: encumbrance.currentLabel,
      max: encumbrance.maxLabel,
      label: encumbrance.label,
      fillPercent: encumbrance.fillPercent,
      breakpoints: encumbrance.breakpoints.map((breakpoint) => ({
        value: String(breakpoint.value),
        leftPercent: breakpoint.leftPercent
      }))
    }
  };
}
