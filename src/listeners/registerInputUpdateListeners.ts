import type { HtmlRoot } from "../types.js";
import { reportError } from "../utils/reportError.js";

export function registerInputUpdateListeners(
  html: HtmlRoot,
  sheet: foundry.appv1.sheets.ActorSheet
): void {
  const editableFields = html.find(".editable-field");
  const editInputs = html.find("input.edit-input");

  editableFields.on("click", function (e) {
    const span = $(this);
    const input = span.siblings("input.edit-input");

    if (!input.length) return;
    span.hide();
    input.val(span.text());
    input.show().focus();
  });

  function saveField(input: JQuery<HTMLElement>, span: JQuery<HTMLElement>) {
    const value = input.val() as string;

    span.text(value);
    input.hide();
    span.show();

    // Prepare form data for update
    const field = input.attr("name");

    if (!field) return;
    const formData: Record<string, unknown> = {};

    formData[field] = value;

    // Use the public actor.update method
    if (sheet.actor) {
      void sheet.actor.update(formData).catch((error) => {
        reportError("Failed to update actor field.", error);
      });
    }
  }

  editInputs.on("blur", function (e) {
    const input = $(this);
    const span = input.siblings(".editable-field");

    saveField(input, span);
  });

  editInputs.on("keydown", function (e) {
    if (e.key === "Enter") {
      const input = $(this);
      const span = input.siblings(".editable-field");

      saveField(input, span);
    }
  });
}
