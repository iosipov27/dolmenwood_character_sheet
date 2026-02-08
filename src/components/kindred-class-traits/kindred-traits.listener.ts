import type { DwFlags, GetDwFlags, HtmlRoot, JQueryWithOn, SetDwFlags } from "../../types.js";
import { reportError } from "../../utils/reportError.js";

export function registerKindredTraitsListener(
  html: HtmlRoot,
  { getDwFlags, setDwFlags }: { getDwFlags: GetDwFlags; setDwFlags: SetDwFlags }
): void {
  const traitsDisplay = html.find(".dw-kindred-traits-display");
  const traitsContent = traitsDisplay.find(".dw-traits-content") as JQueryWithOn<HTMLElement>;
  const traitsTextarea = html.find(
    ".dw-kindred-traits-textarea"
  ) as JQueryWithOn<HTMLTextAreaElement>;

  function openEditor() {
    traitsTextarea.val(traitsContent.text());
    traitsDisplay.hide();
    traitsTextarea.show().focus();

    const textareaElement = traitsTextarea.get(0);
    if (textareaElement) {
      textareaElement.selectionStart = textareaElement.value.length;
      textareaElement.selectionEnd = textareaElement.value.length;
    }
  }

  async function saveTraits(): Promise<void> {
    const value = String(traitsTextarea.val() ?? "");
    const dw = foundry.utils.duplicate(getDwFlags()) as DwFlags;
    dw.meta.kindredClassTraits = value;

    traitsContent.text(value);
    traitsTextarea.hide();
    traitsDisplay.show();

    try {
      await setDwFlags(dw);
    } catch (error) {
      reportError("Failed to update kindred class traits.", error);
    }
  }

  traitsContent.on("click", () => {
    if (!traitsTextarea.is(":hidden")) return;
    openEditor();
  });

  traitsTextarea.on("blur", () => {
    void saveTraits();
  });

  traitsTextarea.on("keydown", (event) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    traitsTextarea.trigger("blur");
  });
}
