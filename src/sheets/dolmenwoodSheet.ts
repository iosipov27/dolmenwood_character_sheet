import { MODULE_ID } from "../constants/moduleId.js";
import { OseCharacterSheetAdapter } from "../adapters/oseCharacterSheetAdapter.js";
import { registerSheetListeners } from "../listeners/registerSheetListeners.js";
import { registerFormChangeListener } from "../listeners/registerFormChangeListener.js";
import { cleanDwFlagsWithSchema } from "../models/dwSchema.js";
import { buildDwFlagsFromActor } from "../models/buildDwFlagsFromActor.js";
import { DolmenwoodSheetData } from "../models/dolmenwoodSheetData.js";
import type { DwFlags, DwSheetData, HtmlRoot } from "../types.js";
import { getBaseOSECharacterSheetClass } from "../utils/getBaseOSECharacterSheetClass.js";

const BaseSheet = getBaseOSECharacterSheetClass() as typeof foundry.appv1.sheets.ActorSheet;

export class DolmenwoodSheet extends BaseSheet {
  constructor(...args: ConstructorParameters<typeof BaseSheet>) {
    super(...args);
  }

  static get defaultOptions(): ActorSheet.Options {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["dolmenwood", "sheet", "actor"],
      template: `modules/${MODULE_ID}/templates/dolmenwood.hbs`,
      width: 640,
      height: 730,
      closeOnSubmit: false,
      submitOnClose: false,
      submitOnChange: false,
      tabs: [
        {
          navSelector: ".dolmenwood-sheet__tabs",
          contentSelector: ".dolmenwood-sheet__content",
          initial: "main"
        }
      ],
      resizable: true
    });
  }

  getData(options?: Partial<ActorSheet.Options>): DwSheetData {
    const data = super.getData(options) as DwSheetData;

    return DolmenwoodSheetData.populate(data, this.actor);
  }

  activateListeners(html: HtmlRoot): void {
    super.activateListeners(html);

    registerFormChangeListener(html, {
      onFieldChange: async (name, value) => {
        await this.handleFieldChange(name, value);
      }
    });

    registerSheetListeners(html, {
      actor: this.actor,
      getDwFlags: () => this.getDwFlags(),
      setDwFlags: async (dw) => {
        await this.updateDw(dw);
      }
    });
  }

  protected override async _onDropItem(
    event: DragEvent,
    data: ActorSheet.DropData.Item
  ): Promise<unknown> {
    if (!this.isDropInsideSpellsAbilitiesTab(event)) {
      return super._onDropItem(event, data);
    }

    const dropKind = this.getDropKindFromEvent(event);

    if (!dropKind) return null;

    const droppedItem = await Item.fromDropData(data);

    if (!droppedItem) return null;

    const itemType = String(droppedItem.type ?? "").toLowerCase();

    if (itemType !== dropKind) {
      const messageKey =
        dropKind === "spell"
          ? "DOLMENWOOD.UI.SpellsDropOnlySpells"
          : "DOLMENWOOD.UI.SpellsDropOnlyAbilities";

      ui.notifications?.warn(this.localize(messageKey));

      return null;
    }

    return super._onDropItem(event, data);
  }

  private getDwFlags(): DwFlags {
    return buildDwFlagsFromActor(this.actor);
  }

  private async updateDw(dwPatch: object): Promise<void> {
    const nextDw = foundry.utils.duplicate(this.getDwFlags()) as Record<string, unknown>;
    const flattenedPatch = foundry.utils.flattenObject(
      foundry.utils.duplicate(dwPatch) as Record<string, unknown>
    ) as Record<string, unknown>;

    for (const [path, value] of Object.entries(flattenedPatch)) {
      foundry.utils.setProperty(nextDw, path, value);
    }

    const cleanedDw = cleanDwFlagsWithSchema(nextDw);

    if (!cleanedDw) return;

    await this.actor.update({
      [`flags.${MODULE_ID}.dw`]: cleanedDw
    });
  }

  private async handleFieldChange(name: string, value: unknown): Promise<void> {
    if (name.startsWith("dw.")) {
      const dwPath = name.slice(3);
      const dwPatch: Record<string, unknown> = {};

      foundry.utils.setProperty(dwPatch, dwPath, value);

      await this.updateDw(dwPatch);

      return;
    }

    if (name === `flags.${MODULE_ID}.dw` || name.startsWith(`flags.${MODULE_ID}.dw.`)) {
      return;
    }

    const actorUpdate =
      name === "system.ac.value" || name === "system.aac.value"
        ? OseCharacterSheetAdapter.remapDerivedArmorClassEdits({ [name]: value }, this.actor)
        : { [name]: value };

    if (Object.keys(actorUpdate).length === 0) return;

    await this.actor.update(actorUpdate);
  }

  private isDropInsideSpellsAbilitiesTab(event: DragEvent): boolean {
    const targetElement = this.getDropTargetElement(event);

    if (!targetElement) return false;

    return Boolean(targetElement.closest(".tab[data-tab='spells-abilities']"));
  }

  private getDropKindFromEvent(event: DragEvent): "spell" | "ability" | null {
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

  private readonly localize = (key: string): string => game.i18n?.localize(key) ?? key;
}
