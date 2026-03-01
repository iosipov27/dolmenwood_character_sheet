import type { HtmlRoot } from "../../types.js";

export function registerEquipmentListener(html: HtmlRoot): void {
  const equipmentRoot = html.find(".dw-equipment");

  if (!equipmentRoot.length) return;

  const weightFieldSelector = "input[name^='dw.meta.equipment.'][name*='Weight']";
  const stowedItemSelector = "input[name^='dw.meta.equipment.stowed']:not([name*='Weight'])";
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

  refreshTotalWeight();
}
