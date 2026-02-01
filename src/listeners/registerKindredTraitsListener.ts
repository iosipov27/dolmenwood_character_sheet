import type { HtmlRoot, JQueryWithOn } from "../types.js";

export function registerKindredTraitsListener(html: HtmlRoot): void {
  // Kindred & Class Traits - Toggle edit mode
  const traitsDisplay = html.find(".dw-kindred-traits-display");
  const traitsTextarea = html.find(".dw-kindred-traits-textarea") as JQueryWithOn<HTMLTextAreaElement>;
  const editBtn = html.find('button[data-action="dw-toggle-kindred-traits"]') as JQueryWithOn<HTMLElement>;

  editBtn.on("click", (ev: Event) => {
    ev.preventDefault();
    const isHidden = traitsTextarea.is(":hidden");

    if (isHidden) {
      // Show textarea, hide display
      traitsDisplay.hide();
      traitsTextarea.show().focus();
      editBtn.text("Done");
    } else {
      // Hide textarea, show display
      traitsDisplay.find(".dw-traits-content").text(traitsTextarea.val() as string);
      traitsTextarea.hide();
      traitsDisplay.show();
      editBtn.text("Edit");
    }
  });
}
