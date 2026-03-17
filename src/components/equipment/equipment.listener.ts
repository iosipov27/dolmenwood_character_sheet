import type { ApplyDwPatch, HtmlRoot } from "../../types/index.js";
import {
  createEmptyDwEquipmentCompendiumItem,
  getDwEquipmentCompendiumKey,
  getDwEquipmentWeightKey,
  parseDwEquipmentSlotKey
} from "../../utils/equipmentSlots.js";
import {
  buildDwEncumbranceSummary,
  formatDwLoad,
  parseDwLoadValue
} from "../../utils/encumbrance.js";

type EquipmentDropData = ActorSheet.DropData.Item & Record<string, unknown>;
const DISALLOWED_EQUIPMENT_ITEM_TYPES = new Set(["spell", "ability"]);

interface EquipmentListenerDependencies {
  applyDwPatch: ApplyDwPatch;
  fromDropData: (data: ActorSheet.DropData.Item) => Promise<Item | null>;
  fromUuid: (uuid: string) => Promise<Item | null>;
  localize: (key: string) => string;
  warn: (message: string) => void;
}

export function registerEquipmentListener(
  html: HtmlRoot,
  { applyDwPatch, fromDropData, fromUuid, localize, warn }: EquipmentListenerDependencies
): void {
  const equipmentRoot = html.find(".dw-equipment");

  if (!equipmentRoot.length) return;

  const weightFieldSelector = "input[name^='dw.meta.equipment.'][name*='Weight']";
  const coinFieldSelector = "input[name^='dw.meta.coins.']";
  const stowedItemSelector = "input[name^='dw.meta.equipment.stowed']:not([name*='Weight'])";
  const slotSelector = "[data-dw-equipment-slot]";
  const openSelector = "[data-dw-equipment-open]";
  const removeSelector = "[data-dw-equipment-remove]";
  const totalWeightValue = equipmentRoot.find("[data-total-weight]");
  const encumbranceLabel = equipmentRoot.find("[data-encumbrance-label]");
  const encumbranceBar = equipmentRoot.find("[data-encumbrance-bar]");
  const refreshStowedItemTooltip = (field: HTMLInputElement): void => {
    const tooltipManager = game?.tooltip;
    const value = String(field.value ?? "");

    field.removeAttribute("title");

    if (!tooltipManager) return;

    if (!value.trim()) {
      tooltipManager.deactivate();

      return;
    }

    const hasOverflow = field.scrollWidth > field.clientWidth;

    if (hasOverflow) {
      tooltipManager.activate(field, { text: value });
    } else {
      tooltipManager.deactivate();
    }
  };

  const refreshTotalWeight = (): void => {
    if (!totalWeightValue.length) return;

    const total = equipmentRoot
      .find(weightFieldSelector)
      .toArray()
      .map((field) => parseDwLoadValue($(field).val()))
      .reduce((sum, weight) => sum + weight, 0);

    totalWeightValue.text(formatDwLoad(total));
  };

  const refreshEncumbrance = (): void => {
    if (!encumbranceLabel.length || !encumbranceBar.length) return;

    const equipmentWeight = equipmentRoot
      .find(weightFieldSelector)
      .toArray()
      .map((field) => parseDwLoadValue($(field).val()))
      .reduce((sum, weight) => sum + weight, 0);
    const coinWeight = html
      .find(coinFieldSelector)
      .toArray()
      .map((field) => parseDwLoadValue($(field).val()))
      .reduce((sum, weight) => sum + weight, 0);
    const encumbrance = buildDwEncumbranceSummary(equipmentWeight + coinWeight);

    encumbranceLabel.text(encumbrance.label);
    encumbranceBar.attr("style", `width: ${encumbrance.fillPercent}`);
  };

  equipmentRoot.on("change", weightFieldSelector, function () {
    refreshTotalWeight();
    refreshEncumbrance();
  });

  equipmentRoot.on("input", weightFieldSelector, function () {
    refreshTotalWeight();
    refreshEncumbrance();
  });

  html.on("change", coinFieldSelector, function () {
    refreshEncumbrance();
  });

  html.on("input", coinFieldSelector, function () {
    refreshEncumbrance();
  });

  equipmentRoot.on("mouseenter", stowedItemSelector, function () {
    if (!(this instanceof HTMLInputElement)) return;

    refreshStowedItemTooltip(this);
  });

  equipmentRoot.on("input", stowedItemSelector, function () {
    if (!(this instanceof HTMLInputElement)) return;

    game?.tooltip?.deactivate();
  });

  equipmentRoot.on("mouseleave", stowedItemSelector, function () {
    game?.tooltip?.deactivate();
  });

  equipmentRoot.on("dragover", slotSelector, function (event) {
    preventEvent(event);

    const dataTransfer = getEventDataTransfer(event);

    if (dataTransfer) {
      dataTransfer.dropEffect = "copy";
    }
  });

  equipmentRoot.on("drop", slotSelector, async function (event) {
    preventEvent(event);

    const slotElement = this instanceof HTMLElement ? this : null;
    const slotKey = String(slotElement?.dataset.dwEquipmentSlot ?? "");
    const slot = parseDwEquipmentSlotKey(slotKey);

    if (!slot) return;

    const droppedData = getDragEventData(event);

    if (!droppedData) return;

    const droppedItem = await fromDropData(droppedData);

    if (!droppedItem) return;

    const itemType = String(droppedItem.type ?? "")
      .trim()
      .toLowerCase();

    if (DISALLOWED_EQUIPMENT_ITEM_TYPES.has(itemType)) {
      warn(localize("DOLMENWOOD.UI.EquipmentDropNoSpellsOrAbilities"));

      return;
    }

    if (!isCompendiumItem(droppedItem, droppedData)) {
      warn(localize("DOLMENWOOD.UI.EquipmentDropOnlyCompendiumItems"));

      return;
    }

    const itemName = String(droppedItem.name ?? "").trim();
    const itemWeight = extractItemWeight(droppedItem);
    const compendiumKey = getDwEquipmentCompendiumKey(slot.prefix, slot.index);
    const weightKey = getDwEquipmentWeightKey(slot.prefix, slot.index);

    await applyDwPatch({
      meta: {
        equipment: {
          [slot.slotKey]: itemName,
          [weightKey]: itemWeight,
          [compendiumKey]: {
            uuid: extractItemUuid(droppedItem, droppedData),
            name: itemName,
            type: itemType,
            weight: itemWeight
          }
        }
      }
    });
  });

  equipmentRoot.on("click", openSelector, async function (event) {
    preventEvent(event);

    const openButton = this instanceof HTMLElement ? this : null;
    const uuid = String(openButton?.dataset.dwEquipmentOpen ?? "").trim();

    if (!uuid) return;

    const item = await fromUuid(uuid);

    if (!item) return;

    void item.sheet?.render(true);
  });

  equipmentRoot.on("click", removeSelector, async function (event) {
    preventEvent(event);

    const removeButton = this instanceof HTMLElement ? this : null;
    const slotKey = String(removeButton?.dataset.dwEquipmentRemove ?? "");
    const slot = parseDwEquipmentSlotKey(slotKey);

    if (!slot) return;

    const compendiumKey = getDwEquipmentCompendiumKey(slot.prefix, slot.index);
    const weightKey = getDwEquipmentWeightKey(slot.prefix, slot.index);

    await applyDwPatch({
      meta: {
        equipment: {
          [slot.slotKey]: "",
          [weightKey]: "",
          [compendiumKey]: createEmptyDwEquipmentCompendiumItem()
        }
      }
    });
  });

  refreshTotalWeight();
  refreshEncumbrance();
}

function preventEvent(event: { preventDefault?: () => void; stopPropagation?: () => void }): void {
  try {
    event.preventDefault?.();
  } catch {
    // jQuery's synthetic events may point to lightweight originalEvent stubs in tests.
  }

  try {
    event.stopPropagation?.();
  } catch {
    // Keep event handling resilient even when the original DOM event is mocked.
  }
}

function getEventDataTransfer(event: unknown): DataTransfer | null {
  const originalEvent =
    event && typeof event === "object" && "originalEvent" in event
      ? (event as { originalEvent?: unknown }).originalEvent
      : event;

  if (!originalEvent || typeof originalEvent !== "object") return null;

  return ((originalEvent as { dataTransfer?: DataTransfer | null }).dataTransfer ??
    null) as DataTransfer | null;
}

function getDragEventData(event: unknown): EquipmentDropData | null {
  const originalEvent =
    event && typeof event === "object" && "originalEvent" in event
      ? (event as { originalEvent?: unknown }).originalEvent
      : event;

  if (originalEvent && typeof originalEvent === "object") {
    const textEditorApi = globalThis.TextEditor as unknown as
      | {
          getDragEventData?: (dragEvent: DragEvent) => unknown;
        }
      | undefined;

    if (typeof textEditorApi?.getDragEventData === "function") {
      const parsed = textEditorApi.getDragEventData(originalEvent as DragEvent);

      if (parsed && typeof parsed === "object") {
        return parsed as EquipmentDropData;
      }
    }
  }

  const rawData = getEventDataTransfer(event)?.getData("text/plain") ?? "";

  if (!rawData.trim()) return null;

  try {
    const parsed = JSON.parse(rawData);

    return parsed && typeof parsed === "object" ? (parsed as EquipmentDropData) : null;
  } catch {
    return null;
  }
}

function isCompendiumItem(item: Item, data: EquipmentDropData): boolean {
  const pack = String((item as Item & { pack?: string | null }).pack ?? "").trim();
  const uuid = String((item as Item & { uuid?: string | null }).uuid ?? data.uuid ?? "").trim();

  return Boolean(pack || uuid.startsWith("Compendium."));
}

function extractItemUuid(item: Item, data: EquipmentDropData): string {
  return String((item as Item & { uuid?: string | null }).uuid ?? data.uuid ?? "").trim();
}

function extractItemWeight(item: Item): string {
  const rawWeight = foundry.utils.getProperty(item, "system.weight");

  if (typeof rawWeight === "number") {
    return Number.isFinite(rawWeight) ? String(rawWeight) : "";
  }

  if (typeof rawWeight === "string") {
    return rawWeight.trim();
  }

  return "";
}
