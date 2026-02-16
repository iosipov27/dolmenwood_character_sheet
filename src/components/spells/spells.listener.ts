import {
  DW_DELETE_ITEM,
  DW_OPEN_ITEM,
  DW_TOGGLE_COLLAPSIBLE_SECTION
} from "../../constants/templateAttributes.js";
import type { ActionEvent, GetDwFlags, HtmlRoot, SetDwFlags } from "../../types.js";
import { getDataset } from "../../utils/getDataset.js";
import { registerAction } from "../../utils/registerAction.js";

type CollapseKind = "spells" | "traits";

function getCollapseKind(root: HTMLElement): CollapseKind | null {
  const section = root.closest(".dw-spells-abilities__section");

  if (!(section instanceof HTMLElement)) return null;
  if (section.classList.contains("dw-spells-abilities__section--spells")) return "spells";
  if (section.classList.contains("dw-spells-abilities__section--traits")) return "traits";

  return null;
}

function applyCollapsedState(root: HTMLElement, collapsed: boolean): void {
  const section = root.closest(".dw-spells-abilities__section");
  const header = root.querySelector<HTMLElement>("[data-action='dw-toggle-collapsible-section']");

  root.classList.toggle("is-collapsed", collapsed);
  section?.classList.toggle("is-collapsed", collapsed);
  header?.setAttribute("aria-expanded", String(!collapsed));
}

export function registerSpellsListener(
  html: HtmlRoot,
  {
    actor,
    getDwFlags,
    setDwFlags
  }: {
    actor: Actor;
    getDwFlags: GetDwFlags;
    setDwFlags: SetDwFlags;
  }
): void {
  const panel = html.find("[data-tab-panel='spells-abilities']").first();
  const spellsRoot = panel.find(".dw-spells").first().get(0);
  const traitsRoot = panel.find(".dw-ability-items").first().get(0);
  const dw = getDwFlags();

  if (spellsRoot instanceof HTMLElement) {
    applyCollapsedState(spellsRoot, Boolean(dw.meta.spellsCollapsed));
  }

  if (traitsRoot instanceof HTMLElement) {
    applyCollapsedState(traitsRoot, Boolean(dw.meta.traitsCollapsed));
  }

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

    const kind = getCollapseKind(root);

    if (!kind) return;

    const nextCollapsed = root.classList.contains("is-collapsed");
    const flags = getDwFlags();
    const prevCollapsed = kind === "spells" ? flags.meta.spellsCollapsed : flags.meta.traitsCollapsed;

    if (prevCollapsed === nextCollapsed) return;

    if (kind === "spells") {
      flags.meta.spellsCollapsed = nextCollapsed;
    } else {
      flags.meta.traitsCollapsed = nextCollapsed;
    }

    await setDwFlags(flags);
  });
}

function getActorItem(actor: Actor, itemId: string | undefined): Item.Implementation | null {
  if (!itemId) return null;

  return actor.items.get(itemId) ?? null;
}
