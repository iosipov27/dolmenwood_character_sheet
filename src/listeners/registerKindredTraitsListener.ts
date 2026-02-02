import { DW_TOGGLE_KINDRED_TRAITS } from "../constants/templateAttributes.js";
import type { HtmlRoot, JQueryWithOn } from "../types.js";
import { registerAction } from "../utils/registerAction.js";

export function registerKindredTraitsListener(html: HtmlRoot): void {
  // Kindred & Class Traits - Toggle edit mode
  const traitsDisplay = html.find(".dw-kindred-traits-display");
  const traitsTextarea = html.find(
    ".dw-kindred-traits-textarea"
  ) as JQueryWithOn<HTMLTextAreaElement>;
  const editBtn = html.find(
    'button[data-action="dw-toggle-kindred-traits"]'
  ) as JQueryWithOn<HTMLElement>;

  registerAction(html, DW_TOGGLE_KINDRED_TRAITS, async (ev: Event) => {
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
