import type { DwFlags, GetDwFlags, HtmlRoot, JQueryWithOn, SetDwFlags } from "../../types.js";
import { reportError } from "../../utils/reportError.js";

export function registerOtherNotesListener(
  html: HtmlRoot,
  { getDwFlags, setDwFlags }: { getDwFlags: GetDwFlags; setDwFlags: SetDwFlags }
): void {
  const coinInputs = html.find(
    ".dw-other-notes__coin-input[name^='dw.meta.coins.']"
  ) as JQueryWithOn<HTMLInputElement>;

  const persistCoinField = async (element: JQuery<HTMLElement>): Promise<void> => {
    const field = String(element.attr("name") ?? "");

    if (!field.startsWith("dw.meta.coins.")) return;

    const raw = Number(element.val() ?? 0);
    const value = Number.isFinite(raw) && raw >= 0 ? raw : 0;
    const dw = foundry.utils.duplicate(getDwFlags()) as DwFlags;

    foundry.utils.setProperty(dw, field.slice("dw.".length), value);

    try {
      await setDwFlags(dw);
    } catch (error) {
      reportError("Failed to update coins field.", error);
    }
  };

  coinInputs.on("change", function () {
    void persistCoinField($(this));
  });

  coinInputs.on("blur", function () {
    void persistCoinField($(this));
  });
}
