import type { DwFlags, GetDwFlags, HtmlRoot, JQueryWithOn, SetDwFlags } from "../../types.js";
import { EditableTextarea } from "../../utils/EditableTextarea.js";

export function registerLanguagesListener(
  html: HtmlRoot,
  { getDwFlags, setDwFlags }: { getDwFlags: GetDwFlags; setDwFlags: SetDwFlags }
): void {
  const languagesEditable = html.find(".dw-languages-editable") as JQueryWithOn<HTMLElement>;

  new EditableTextarea({
    contentElement: languagesEditable,
    setValue: async (value: string) => {
      const dw = foundry.utils.duplicate(getDwFlags()) as DwFlags;

      dw.meta.languages = value;
      await setDwFlags(dw);
    },
    errorMessage: "Failed to update languages."
  });
}
