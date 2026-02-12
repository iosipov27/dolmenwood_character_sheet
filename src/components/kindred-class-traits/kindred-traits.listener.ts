import type { DwFlags, GetDwFlags, HtmlRoot, JQueryWithOn, SetDwFlags } from "../../types.js";
import { EditableTextarea } from "../../utils/EditableTextarea.js";

export function registerKindredTraitsListener(
  html: HtmlRoot,
  { getDwFlags, setDwFlags }: { getDwFlags: GetDwFlags; setDwFlags: SetDwFlags }
): void {
  const traitsEditable = html.find(".dw-kindred-traits-editable") as JQueryWithOn<HTMLElement>;

  new EditableTextarea({
    contentElement: traitsEditable,
    setValue: async (value: string) => {
      const dw = foundry.utils.duplicate(getDwFlags()) as DwFlags;

      dw.meta.kindredClassTraits = value;
      await setDwFlags(dw);
    },
    errorMessage: "Failed to update kindred class traits."
  });
}
