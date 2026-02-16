import {
  DW_DELETE_ITEM,
  DW_OPEN_ITEM
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
}

function getActorItem(actor: Actor, itemId: string | undefined): Item.Implementation | null {
  if (!itemId) return null;

  return actor.items.get(itemId) ?? null;
}
