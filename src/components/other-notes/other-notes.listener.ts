import type { DwFlags, GetDwFlags, HtmlRoot, JQueryWithOn, SetDwFlags } from "../../types.js";
import { EditableTextarea } from "../../utils/EditableTextarea.js";

export function registerOtherNotesListener(
  html: HtmlRoot,
  { getDwFlags, setDwFlags }: { getDwFlags: GetDwFlags; setDwFlags: SetDwFlags }
): void {
  const notesEditable = html.find(".dw-other-notes-editable") as JQueryWithOn<HTMLElement>;

  new EditableTextarea({
    contentElement: notesEditable,
    setValue: async (value: string) => {
      const dw = foundry.utils.duplicate(getDwFlags()) as DwFlags;
      dw.meta.otherNotes = value;
      await setDwFlags(dw);
    },
    errorMessage: "Failed to update other notes."
  });
}
