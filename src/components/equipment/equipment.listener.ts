import type { DwFlags, GetDwFlags, HtmlRoot, SetDwFlags } from "../../types.js";
import { reportError } from "../../utils/reportError.js";

export function registerEquipmentListener(
  html: HtmlRoot,
  { getDwFlags, setDwFlags }: { getDwFlags: GetDwFlags; setDwFlags: SetDwFlags }
): void {
  const equipmentFields = html.find(".dw-equipment input.edit-input[name^='dw.meta.equipment.']");
  const tinyDisplay = html.find(".dw-equipment__tiny-display");
  const tinyContent = tinyDisplay.find(".dw-equipment__tiny-content");
  const tinyTextarea = html.find(
    ".dw-equipment__textarea[name='dw.meta.equipment.tinyItems']"
  ) as JQuery<HTMLTextAreaElement>;

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

  function openTinyEditor(): void {
    const dw = getDwFlags();
    const text = String(dw.meta.equipment.tinyItems ?? "");

    tinyTextarea.val(text);
    tinyDisplay.hide();
    tinyTextarea.show().focus();

    const textarea = tinyTextarea.get(0);

    if (!textarea) return;
    textarea.selectionStart = textarea.value.length;
    textarea.selectionEnd = textarea.value.length;
  }

  async function saveTinyEditor(): Promise<void> {
    const value = String(tinyTextarea.val() ?? "");
    const dw = foundry.utils.duplicate(getDwFlags()) as DwFlags;

    foundry.utils.setProperty(dw, "meta.equipment.tinyItems", value);
    tinyContent.html(value.replace(/\n/g, "<br>"));
    tinyTextarea.hide();
    tinyDisplay.show();

    try {
      await setDwFlags(dw);
    } catch (error) {
      reportError("Failed to update tiny items.", error);
    }
  }

  equipmentFields.on("change", function () {
    void persistField($(this));
  });

  equipmentFields.on("blur", function () {
    void persistField($(this));
  });

  tinyDisplay.on("click", () => {
    if (!tinyTextarea.is(":hidden")) return;
    openTinyEditor();
  });

  tinyTextarea.on("blur", () => {
    void saveTinyEditor();
  });

  tinyTextarea.on("keydown", (event) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    tinyTextarea.trigger("blur");
  });
}
