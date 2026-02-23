type DropKind = "spell" | "ability";

type DropValidationResult =
  | { allowed: true }
  | {
      allowed: false;
      warningKey?: "DOLMENWOOD.UI.SpellsDropOnlySpells" | "DOLMENWOOD.UI.SpellsDropOnlyAbilities";
    };

export class SpellsAbilitiesDropHandler {
  static async handleDrop<T>(
    {
      event,
      item,
      onAcceptedDrop,
      localize
    }: {
      event: DragEvent;
      item: Item.Implementation;
      onAcceptedDrop: () => Promise<T>;
      localize: (key: string) => string;
    }
  ): Promise<T | null> {
    if (!this.isDropInsideSpellsAbilitiesTab(event)) {
      return onAcceptedDrop();
    }

    const validation = this.validateDrop(event, item);

    if (!validation.allowed) {
      if (validation.warningKey) {
        ui.notifications?.warn(localize(validation.warningKey));
      }

      return null;
    }

    return onAcceptedDrop();
  }

  private static validateDrop(
    event: DragEvent,
    item: Item.Implementation
  ): DropValidationResult {
    const dropKind = this.getDropKindFromEvent(event);

    if (!dropKind) return { allowed: false };

    const itemType = String(item.type ?? "").toLowerCase();

    if (itemType === dropKind) return { allowed: true };

    return {
      allowed: false,
      warningKey:
        dropKind === "spell"
          ? "DOLMENWOOD.UI.SpellsDropOnlySpells"
          : "DOLMENWOOD.UI.SpellsDropOnlyAbilities"
    };
  }

  private static isDropInsideSpellsAbilitiesTab(event: DragEvent): boolean {
    const targetElement = this.getDropTargetElement(event);

    if (!targetElement) return false;

    return Boolean(targetElement.closest("[data-tab-panel='spells-abilities']"));
  }

  private static getDropKindFromEvent(event: DragEvent): DropKind | null {
    const targetElement = this.getDropTargetElement(event);

    if (!targetElement) return null;

    const rawKind = targetElement.closest("[data-dw-drop-kind]")?.getAttribute("data-dw-drop-kind");

    return rawKind === "spell" || rawKind === "ability" ? rawKind : null;
  }

  private static getDropTargetElement(event: DragEvent): Element | null {
    const target = event.target;

    return target instanceof Element ? target : target instanceof Node ? target.parentElement : null;
  }
}
