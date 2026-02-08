import type { DwFlags, GetDwFlags, HtmlRoot, JQueryWithOn, SetDwFlags } from "../../types.js";
import { reportError } from "../../utils/reportError.js";

export function registerLanguagesListener(
  html: HtmlRoot,
  { getDwFlags, setDwFlags }: { getDwFlags: GetDwFlags; setDwFlags: SetDwFlags }
): void {
  const languagesDisplay = html.find(".dw-languages-display");
  const languagesContent = languagesDisplay.find(".dw-languages-content") as JQueryWithOn<HTMLElement>;
  const languagesTextarea = html.find(".dw-languages-textarea") as JQueryWithOn<HTMLTextAreaElement>;

  function openEditor() {
    languagesTextarea.val(languagesContent.text());
    languagesDisplay.hide();
    languagesTextarea.show().focus();

    const textareaElement = languagesTextarea.get(0);
    if (textareaElement) {
      textareaElement.selectionStart = textareaElement.value.length;
      textareaElement.selectionEnd = textareaElement.value.length;
    }
  }

  async function saveLanguages(): Promise<void> {
    const value = String(languagesTextarea.val() ?? "");
    const dw = foundry.utils.duplicate(getDwFlags()) as DwFlags;
    dw.meta.languages = value;

    languagesContent.text(value);
    languagesTextarea.hide();
    languagesDisplay.show();

    try {
      await setDwFlags(dw);
    } catch (error) {
      reportError("Failed to update languages.", error);
    }
  }

  languagesContent.on("click", () => {
    if (!languagesTextarea.is(":hidden")) return;
    openEditor();
  });

  languagesTextarea.on("blur", () => {
    void saveLanguages();
  });

  languagesTextarea.on("keydown", (event) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    languagesTextarea.trigger("blur");
  });
}
