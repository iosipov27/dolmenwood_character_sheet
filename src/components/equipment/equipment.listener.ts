import type { ApplyDwPatch, HtmlRoot } from "../../types/index.js";
import {
  createEmptyDwEquipmentCompendiumItem,
  getDwEquipmentCompendiumKey,
  getDwEquipmentWeightKey,
  parseDwEquipmentSlotKey
} from "../../utils/equipmentSlots.js";

type EquipmentDropData = ActorSheet.DropData.Item & Record<string, unknown>;

interface EquipmentListenerDependencies {
  applyDwPatch: ApplyDwPatch;
  fromDropData: (data: ActorSheet.DropData.Item) => Promise<Item | null>;
  localize: (key: string) => string;
  warn: (message: string) => void;
}

export function registerEquipmentListener(
  html: HtmlRoot,
  { applyDwPatch, fromDropData, localize, warn }: EquipmentListenerDependencies
): void {
  const equipmentRoot = html.find(".dw-equipment");

  if (!equipmentRoot.length) return;

  const weightFieldSelector = "input[name^='dw.meta.equipment.'][name*='Weight']";
  const stowedItemSelector = "input[name^='dw.meta.equipment.stowed']:not([name*='Weight'])";
  const slotSelector = "[data-dw-equipment-slot]";
  const removeSelector = "[data-dw-equipment-remove]";
  const totalWeightValue = equipmentRoot.find("[data-total-weight]");
  const parseWeight = (value: string): number => {
    const parsed = Number.parseFloat(value);

    return Number.isFinite(parsed) ? parsed : 0;
  };
  const formatTotalWeight = (value: number): string =>
    Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)));
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
      .map((field) => parseWeight(String($(field).val() ?? "")))
      .reduce((sum, weight) => sum + weight, 0);

    totalWeightValue.text(formatTotalWeight(total));
  };

  equipmentRoot.on("change", weightFieldSelector, function () {
    refreshTotalWeight();
  });

  equipmentRoot.on("input", weightFieldSelector, function () {
    refreshTotalWeight();
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

    if (itemType !== "item") {
      warn(localize("DOLMENWOOD.UI.EquipmentDropOnlyItems"));

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
