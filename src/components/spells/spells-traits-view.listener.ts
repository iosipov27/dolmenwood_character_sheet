import { DW_SET_SPELLS_TRAITS_VIEW } from "../../constants/templateAttributes.js";
import type { ActionEvent, GetDwFlags, HtmlRoot, SetDwFlags } from "../../types.js";
import { getDataset } from "../../utils/getDataset.js";
import { registerAction } from "../../utils/registerAction.js";

const VIEW_MODES = ["cards", "text", "both"] as const;
type ViewMode = (typeof VIEW_MODES)[number];
const TOGGLE_VIEW_MODES = ["cards", "text"] as const;
type ToggleViewMode = (typeof TOGGLE_VIEW_MODES)[number];

const VIEW_CLASS_PREFIX = "dw-spells-abilities--view-";
const VIEW_CLASSES = VIEW_MODES.map((mode) => `${VIEW_CLASS_PREFIX}${mode}`).join(" ");

function asViewMode(value: string | undefined): ViewMode | null {
  const normalized = String(value ?? "").trim().toLowerCase();

  return VIEW_MODES.includes(normalized as ViewMode) ? (normalized as ViewMode) : null;
}

function asToggleViewMode(value: string | undefined): ToggleViewMode | null {
  const normalized = String(value ?? "").trim().toLowerCase();

  return TOGGLE_VIEW_MODES.includes(normalized as ToggleViewMode) ? (normalized as ToggleViewMode) : null;
}

function viewModeFromStates({ cards, text }: { cards: boolean; text: boolean }): ViewMode | null {
  if (!cards && !text) return null;
  if (cards && text) return "both";

  return cards ? "cards" : "text";
}

export function registerSpellsTraitsViewListener(
  html: HtmlRoot,
  { getDwFlags, setDwFlags }: { getDwFlags: GetDwFlags; setDwFlags: SetDwFlags }
): void {
  const panel = html.find(".tab[data-tab='spells-abilities']").first();
  const container = panel.find(".dw-spells-abilities").first();
  const buttons = panel.find(`[data-action='${DW_SET_SPELLS_TRAITS_VIEW}']`);
  const cardsButton = buttons.filter("[data-view='cards']");
  const textButton = buttons.filter("[data-view='text']");

  if (!container.length || !buttons.length) return;

  const applyViewMode = (mode: ViewMode): void => {
    container.removeClass(VIEW_CLASSES);
    container.addClass(`${VIEW_CLASS_PREFIX}${mode}`);
    cardsButton.toggleClass("is-active", mode === "cards" || mode === "both");
    textButton.toggleClass("is-active", mode === "text" || mode === "both");
  };

  const savedMode = asViewMode(getDwFlags()?.meta?.spellsTraitsView);

  applyViewMode(savedMode ?? "both");

  registerAction(html, DW_SET_SPELLS_TRAITS_VIEW, async (ev: ActionEvent) => {
    const { view } = getDataset(ev);
    const toggleMode = asToggleViewMode(view);

    if (!toggleMode) return;

    const currentCards = cardsButton.hasClass("is-active");
    const currentText = textButton.hasClass("is-active");
    const nextCards = toggleMode === "cards" ? !currentCards : currentCards;
    const nextText = toggleMode === "text" ? !currentText : currentText;
    const nextMode = viewModeFromStates({ cards: nextCards, text: nextText });

    if (!nextMode) return;

    applyViewMode(nextMode);

    const dw = getDwFlags();

    if (dw.meta.spellsTraitsView === nextMode) return;

    dw.meta.spellsTraitsView = nextMode;
    await setDwFlags(dw);
  });
}
