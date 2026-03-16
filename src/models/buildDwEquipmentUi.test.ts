import { describe, expect, it } from "vitest";
import {
  buildEmptyDwEquipment,
  createEmptyDwEquipmentCompendiumItem
} from "../utils/equipmentSlots.js";
import { buildDwEquipmentUi } from "./buildDwEquipmentUi.js";

describe("buildDwEquipmentUi", () => {
  it("supports mixed plain and compendium-backed equipment slots", () => {
    const equipment = buildEmptyDwEquipment();
    const coins = {
      copper: 0,
      silver: 0,
      gold: 0,
      pellucidium: 0
    };

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

    coins.gold = 13;

    const ui = buildDwEquipmentUi(equipment, coins);

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
      weightValue: "99",
      isCompendiumItem: true,
      compendiumItem: {
        uuid: "Compendium.ose.items.Item.torch",
        name: "Torch",
        weight: "99"
      }
    });
    expect(ui.totalWeight).toBe("104");
    expect(ui.encumbrance).toMatchObject({
      current: "117",
      max: "1600",
      label: "117 / 1600",
      fillPercent: "7.31%"
    });
    expect(ui.encumbrance.breakpoints).toEqual([
      { value: "400", leftPercent: "25%" },
      { value: "600", leftPercent: "37.5%" },
      { value: "800", leftPercent: "50%" }
    ]);
  });

  it("prefers editable slot weight over compendium metadata weight", () => {
    const equipment = buildEmptyDwEquipment();
    const coins = {
      copper: 0,
      silver: 0,
      gold: 0,
      pellucidium: 0
    };

    equipment.stowedCompendium1 = {
      uuid: "Compendium.ose.items.Item.torch",
      name: "Torch",
      type: "item",
      weight: "2"
    };
    equipment.stowedWeight1 = "7";

    const ui = buildDwEquipmentUi(equipment, coins);

    expect(ui.stowedFields[0]).toMatchObject({
      isCompendiumItem: true,
      value: "Torch",
      weightValue: "7",
      compendiumItem: {
        uuid: "Compendium.ose.items.Item.torch",
        name: "Torch",
        weight: "7"
      }
    });
    expect(ui.totalWeight).toBe("7");
  });
});
