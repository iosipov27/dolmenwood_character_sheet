import { DW_TOGGLE_KINDRED_TRAITS } from "../constants/templateAttributes.js";
import type { HtmlRoot, JQueryWithOn } from "../types.js";
import { registerAction } from "../utils/registerAction.js";

export function registerKindredTraitsListener(html: HtmlRoot): void {
  const localize = (key: string): string => game.i18n?.localize(key) ?? key;

  // Kindred & Class Traits - Toggle edit mode
  const traitsDisplay = html.find(".dw-kindred-traits-display");
  const traitsTextarea = html.find(
    ".dw-kindred-traits-textarea"
  ) as JQueryWithOn<HTMLTextAreaElement>;
  const editBtn = html.find(
    `button[data-action="${DW_TOGGLE_KINDRED_TRAITS}"]`
  ) as JQueryWithOn<HTMLElement>;

  registerAction(html, DW_TOGGLE_KINDRED_TRAITS, () => {
    const isHidden = traitsTextarea.is(":hidden");

    if (isHidden) {
      // Show textarea, hide display
      traitsDisplay.hide();
      traitsTextarea.show().focus();
      editBtn.text(localize("DOLMENWOOD.UI.Done"));
    } else {
      // Hide textarea, show display
      traitsDisplay.find(".dw-traits-content").text(traitsTextarea.val() as string);
      traitsTextarea.hide();
      traitsDisplay.show();
      editBtn.text(localize("DOLMENWOOD.UI.Edit"));
    }
  });
}
