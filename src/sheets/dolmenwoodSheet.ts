import { MODULE_ID } from "../constants/moduleId.js";
import { FormDataHandler } from "../handlers/formDataHandler.js";
import { registerSheetListeners } from "../listeners/registerSheetListeners.js";
import { DolmenwoodSheetData } from "../models/dolmenwoodSheetData.js";
import { readDwFlags, writeDwFlags } from "../repositories/dwFlagsRepository.js";
import type { DwSheetData, HtmlRoot } from "../types.js";
import { SpellsAbilitiesDropHandler } from "../utils/spellsAbilitiesDropHandler.js";

const TAB_GROUP = "dolmenwood-sheet-tabs";
const TAB_NAV_SELECTOR = ".dolmenwood-sheet__tabs";
const TAB_CONTENT_SELECTOR = ".dolmenwood-sheet__content";

export class DolmenwoodSheet extends ActorSheet {
  private readonly formDataHandler: FormDataHandler;

  constructor(...args: ConstructorParameters<typeof ActorSheet>) {
    super(...args);
    this.formDataHandler = new FormDataHandler(this.actor);
  }

  static get defaultOptions(): ActorSheet.Options {
    const options = foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["dolmenwood", "sheet", "actor"],
      template: `modules/${MODULE_ID}/templates/dolmenwood.hbs`,
      width: 640,
      height: 730,
      closeOnSubmit: false,
      submitOnClose: true,
      submitOnChange: true,
      resizable: true
    });

    options.tabs = [
      {
        group: TAB_GROUP,
        navSelector: TAB_NAV_SELECTOR,
        contentSelector: TAB_CONTENT_SELECTOR,
        initial: "main"
      }
    ];

    return options;
  }

  getData(options?: Partial<ActorSheet.Options>): DwSheetData {
    const data = super.getData(options);

    return DolmenwoodSheetData.populate(data, this.actor);
  }

  activateListeners(html: HtmlRoot): void {
    super.activateListeners(html);

    registerSheetListeners(html, {
      actor: this.actor,
      getDwFlags: () => readDwFlags(this.actor),
      setDwFlags: (dw) => writeDwFlags(this.actor, dw)
    });
  }

  protected override async _onDropItem(
    event: DragEvent,
    data: ActorSheet.DropData.Item
  ): Promise<unknown> {
    const droppedItem = await Item.fromDropData(data);

    if (!(droppedItem instanceof Item)) return null;

    return SpellsAbilitiesDropHandler.handleDrop({
      event,
      item: droppedItem,
      onAcceptedDrop: () => super._onDropItem(event, data),
      localize: this.localize
    });
  }

  async _updateObject(event: Event, formData: Record<string, unknown>): Promise<void> {
    const processedData = await this.formDataHandler.handleFormData(formData);

    await super._updateObject(event, processedData);
  }

  private readonly localize = (key: string): string => game.i18n?.localize(key) ?? key;
}
