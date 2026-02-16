import { DW_SET_SPELLS_TRAITS_VIEW } from "../../constants/templateAttributes.js";
import type { ActionEvent, GetDwFlags, HtmlRoot, SetDwFlags } from "../../types.js";
import { getDataset } from "../../utils/getDataset.js";
import { registerAction } from "../../utils/registerAction.js";

const VIEW_MODES = ["cards", "text", "both"] as const;
type ViewMode = (typeof VIEW_MODES)[number];

const VIEW_CLASS_PREFIX = "dw-spells-abilities--view-";
const VIEW_CLASSES = VIEW_MODES.map((mode) => `${VIEW_CLASS_PREFIX}${mode}`).join(" ");

function asViewMode(value: string | undefined): ViewMode | null {
  const normalized = String(value ?? "").trim().toLowerCase();

  return VIEW_MODES.includes(normalized as ViewMode) ? (normalized as ViewMode) : null;
}

export function registerSpellsTraitsViewListener(
  html: HtmlRoot,
  { getDwFlags, setDwFlags }: { getDwFlags: GetDwFlags; setDwFlags: SetDwFlags }
): void {
  const panel = html.find("[data-tab-panel='spells-abilities']").first();
  const container = panel.find(".dw-spells-abilities").first();
  const buttons = panel.find(`[data-action='${DW_SET_SPELLS_TRAITS_VIEW}']`);

  if (!container.length || !buttons.length) return;

  const applyViewMode = (mode: ViewMode): void => {
    container.removeClass(VIEW_CLASSES);
    container.addClass(`${VIEW_CLASS_PREFIX}${mode}`);
    buttons.removeClass("is-active");
    buttons.filter(`[data-view='${mode}']`).addClass("is-active");
  };

  const savedMode = asViewMode(getDwFlags()?.meta?.spellsTraitsView);

  applyViewMode(savedMode ?? "both");

  registerAction(html, DW_SET_SPELLS_TRAITS_VIEW, async (ev: ActionEvent) => {
    const { view } = getDataset(ev);
    const mode = asViewMode(view);

    if (!mode) return;

    applyViewMode(mode);

    const dw = getDwFlags();

    if (dw.meta.spellsTraitsView === mode) return;

    dw.meta.spellsTraitsView = mode;
    await setDwFlags(dw);
  });
}
