import type { HtmlRoot, JQueryWithOn } from "../types.js";

export function registerLanguagesListener(html: HtmlRoot): void {
  // Languages - Toggle edit mode
  const languagesDisplay = html.find(".dw-languages-display");
  const languagesTextarea = html.find(".dw-languages-textarea") as JQueryWithOn<HTMLTextAreaElement>;
  const langEditBtn = html.find('button[data-action="dw-toggle-languages"]') as JQueryWithOn<HTMLElement>;

  langEditBtn.on("click", (ev: Event) => {
    ev.preventDefault();
    const isHidden = languagesTextarea.is(":hidden");

    if (isHidden) {
      // Show textarea, hide display
      languagesDisplay.hide();
      languagesTextarea.show().focus();
      langEditBtn.text("Done");
    } else {
      // Hide textarea, show display
      languagesDisplay.find(".dw-languages-content").text(languagesTextarea.val() as string);
      languagesTextarea.hide();
      languagesDisplay.show();
      langEditBtn.text("Edit");
    }
  });
}
