import type { DwFlags, GetDwFlags, HtmlRoot, JQueryWithOn, SetDwFlags } from "../../types.js";
import { reportError } from "../../utils/reportError.js";
import { EditableTextarea } from "../../utils/EditableTextarea.js";

export function registerEquipmentListener(
  html: HtmlRoot,
  { getDwFlags, setDwFlags }: { getDwFlags: GetDwFlags; setDwFlags: SetDwFlags }
): void {
  const equipmentFields = html.find(".dw-equipment input.edit-input[name^='dw.meta.equipment.']");
  const equipmentWeightFields = html.find(
    ".dw-equipment input.edit-input[name^='dw.meta.equipment.'][name*='Weight']"
  );
  const totalWeightValue = html.find(".dw-equipment [data-total-weight]");
  const tinyEditable = html.find(".dw-equipment__tiny-editable") as JQueryWithOn<HTMLElement>;
  const parseWeight = (value: string): number => {
    const parsed = Number.parseFloat(value);

    return Number.isFinite(parsed) ? parsed : 0;
  };
  const formatTotalWeight = (value: number): string =>
    Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)));

  const refreshTotalWeight = (): void => {
    if (!totalWeightValue.length) return;

    const total = equipmentWeightFields
      .toArray()
      .map((field) => parseWeight(String($(field).val() ?? "")))
      .reduce((sum, weight) => sum + weight, 0);

    totalWeightValue.text(formatTotalWeight(total));
  };

  async function persistField(element: JQuery<HTMLElement>): Promise<void> {
    const field = String(element.attr("name") ?? "");

    if (!field.startsWith("dw.meta.equipment.")) return;

    const value = String(element.val() ?? "");
    const dw = foundry.utils.duplicate(getDwFlags()) as DwFlags;

    foundry.utils.setProperty(dw, field.slice("dw.".length), value);

    try {
      await setDwFlags(dw);
    } catch (error) {
      reportError("Failed to update equipment field.", error);
    }
  }

  equipmentFields.on("change", function () {
    refreshTotalWeight();
    void persistField($(this));
  });

  equipmentFields.on("blur", function () {
    refreshTotalWeight();
    void persistField($(this));
  });

  refreshTotalWeight();

  new EditableTextarea({
    contentElement: tinyEditable,
    setValue: async (value: string) => {
      const dw = foundry.utils.duplicate(getDwFlags()) as DwFlags;
      foundry.utils.setProperty(dw, "meta.equipment.tinyItems", value);
      await setDwFlags(dw);
    },
    errorMessage: "Failed to update tiny items."
  });
}
