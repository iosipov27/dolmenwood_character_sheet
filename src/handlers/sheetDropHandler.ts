type DropKind = "spell" | "ability";

export class SheetDropHandler {
  constructor(
    private readonly dependencies: {
      fromDropData: (data: ActorSheet.DropData.Item) => Promise<Item | null>;
      localize: (key: string) => string;
      warn: (message: string) => void;
    }
  ) {}

  async handleItemDrop(
    event: DragEvent,
    data: ActorSheet.DropData.Item,
    { forwardDrop }: { forwardDrop: () => Promise<unknown> }
  ): Promise<unknown> {
    if (!this.isDropInsideSpellsAbilitiesTab(event)) {
      return forwardDrop();
    }

    const dropKind = this.getDropKindFromEvent(event);

    if (!dropKind) return null;

    const droppedItem = await this.dependencies.fromDropData(data);

    if (!droppedItem) return null;

    const itemType = String(droppedItem.type ?? "").toLowerCase();

    if (itemType !== dropKind) {
      const messageKey =
        dropKind === "spell"
          ? "DOLMENWOOD.UI.SpellsDropOnlySpells"
          : "DOLMENWOOD.UI.SpellsDropOnlyAbilities";

      this.dependencies.warn(this.dependencies.localize(messageKey));

      return null;
    }

    return forwardDrop();
  }

  private isDropInsideSpellsAbilitiesTab(event: DragEvent): boolean {
    const targetElement = this.getDropTargetElement(event);

    if (!targetElement) return false;

    return Boolean(targetElement.closest(".tab[data-tab='spells-abilities']"));
  }

  private getDropKindFromEvent(event: DragEvent): DropKind | null {
    const targetElement = this.getDropTargetElement(event);

    if (!targetElement) return null;

    const rawKind = targetElement.closest("[data-dw-drop-kind]")?.getAttribute("data-dw-drop-kind");

    return rawKind === "spell" || rawKind === "ability" ? rawKind : null;
  }

  private getDropTargetElement(event: DragEvent): Element | null {
    const target = event.target;

    return target instanceof Element
      ? target
      : target instanceof Node
        ? target.parentElement
        : null;
  }
}
