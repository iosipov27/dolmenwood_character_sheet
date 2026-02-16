import {
  DW_DELETE_ITEM,
  DW_OPEN_ITEM,
  DW_TOGGLE_COLLAPSIBLE_SECTION
} from "../../constants/templateAttributes.js";
import type { ActionEvent, HtmlRoot } from "../../types.js";
import { getDataset } from "../../utils/getDataset.js";
import { registerAction } from "../../utils/registerAction.js";

export function registerSpellsListener(html: HtmlRoot, actor: Actor): void {
  registerAction(html, DW_OPEN_ITEM, async (event: ActionEvent) => {
    const { itemId } = getDataset(event);
    const item = getActorItem(actor, itemId);

    if (!item) return;

    void item.sheet?.render(true);
  });

  registerAction(html, DW_DELETE_ITEM, async (event: ActionEvent) => {
    const { itemId } = getDataset(event);
    const item = getActorItem(actor, itemId);

    if (!item) return;

    await item.deleteDialog();
  });

  registerAction(html, DW_TOGGLE_COLLAPSIBLE_SECTION, async (event: ActionEvent) => {
    const target = event.currentTarget;

    if (!(target instanceof HTMLElement)) return;

    const root = target.closest(".dw-spells, .dw-ability-items");

    if (!(root instanceof HTMLElement)) return;

    const section = root.closest(".dw-spells-abilities__section");

    root.classList.toggle("is-collapsed");
    section?.classList.toggle("is-collapsed");

    const expanded = !root.classList.contains("is-collapsed");
    target.setAttribute("aria-expanded", String(expanded));
  });
}

function getActorItem(actor: Actor, itemId: string | undefined): Item.Implementation | null {
  if (!itemId) return null;

  return actor.items.get(itemId) ?? null;
}
