import { describe, expect, it } from "vitest";
import {
  buildEmptyDwEquipment,
  createEmptyDwEquipmentCompendiumItem
} from "../utils/equipmentSlots.js";
import { buildDwEquipmentUi } from "./buildDwEquipmentUi.js";

describe("buildDwEquipmentUi", () => {
  it("supports mixed plain and compendium-backed equipment slots", () => {
    const equipment = buildEmptyDwEquipment();

    equipment.equipped1 = "Backpack";
    equipment.equippedWeight1 = "5";
    equipment.stowed1 = "Old text";
    equipment.stowedWeight1 = "99";
    equipment.stowedCompendium1 = {
      uuid: "Compendium.ose.items.Item.torch",
      name: "Torch",
      type: "item",
      weight: "2"
    };
    equipment.equippedCompendium2 = createEmptyDwEquipmentCompendiumItem();

    const ui = buildDwEquipmentUi(equipment);

    expect(ui.equippedFields[0]).toMatchObject({
      slotKey: "equipped1",
      value: "Backpack",
      weightValue: "5",
      isCompendiumItem: false,
      compendiumItem: null
    });
    expect(ui.stowedFields[0]).toMatchObject({
      slotKey: "stowed1",
      value: "Torch",
      weightValue: "2",
      isCompendiumItem: true,
      compendiumItem: {
        uuid: "Compendium.ose.items.Item.torch",
        name: "Torch",
        weight: "2"
      }
    });
    expect(ui.totalWeight).toBe("7");
  });
});
