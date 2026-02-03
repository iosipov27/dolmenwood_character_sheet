import type { HtmlRoot } from "../types.js";

export function registerInputUpdateListeners(html: HtmlRoot, sheet: any) {
  html.find(".editable-field").on("click", function (e) {
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
    // Build formData for _onSubmit
    const formData: Record<string, unknown> = {};
    formData[field] = value;
    // Submit update
    sheet._onSubmit(
      {
        preventDefault: () => {},
        currentTarget: html[0],
        target: html[0]
      } as unknown as Event,
      formData
    );
  }

  html.find("input.edit-input").on("blur", function (e) {
    const input = $(this);
    const span = input.siblings(".editable-field");
    saveField(input, span);
  });

  html.find("input.edit-input").on("keydown", function (e) {
    if (e.key === "Enter") {
      const input = $(this);
      const span = input.siblings(".editable-field");
      saveField(input, span);
    }
  });
}
