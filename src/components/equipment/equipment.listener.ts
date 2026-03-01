import type { HtmlRoot } from "../../types.js";

export function registerEquipmentListener(html: HtmlRoot): void {
  const equipmentWeightFields = html.find(
    ".dw-equipment input[name^='dw.meta.equipment.'][name*='Weight']"
  );
  const stowedItemFields = html.find(
    ".dw-equipment input[name^='dw.meta.equipment.stowed']:not([name*='Weight'])"
  );
  const totalWeightValue = html.find(".dw-equipment [data-total-weight]");
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

    const total = equipmentWeightFields
      .toArray()
      .map((field) => parseWeight(String($(field).val() ?? "")))
      .reduce((sum, weight) => sum + weight, 0);

    totalWeightValue.text(formatTotalWeight(total));
  };

  equipmentWeightFields.on("change", function () {
    refreshTotalWeight();
  });

  equipmentWeightFields.on("input", function () {
    refreshTotalWeight();
  });

  stowedItemFields.on("mouseenter", function () {
    if (!(this instanceof HTMLInputElement)) return;

    refreshStowedItemTooltip(this);
  });

  stowedItemFields.on("input", function () {
    if (!(this instanceof HTMLInputElement)) return;

    game?.tooltip?.deactivate();
  });

  stowedItemFields.on("mouseleave", function () {
    game?.tooltip?.deactivate();
  });

  refreshTotalWeight();
}
