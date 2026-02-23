import { MODULE_ID } from "../constants/moduleId.js";
import { FormDataHandler } from "../handlers/formDataHandler.js";
import { registerSheetListeners } from "../listeners/registerSheetListeners.js";
import { DolmenwoodSheetData } from "../models/dolmenwoodSheetData.js";
import { DwFlagsRepository } from "../repositories/dwFlagsRepository.js";
import type { DwSheetData, HtmlRoot } from "../types.js";
import { getBaseOSECharacterSheetClass } from "../utils/getBaseOSECharacterSheetClass.js";
import { SpellsAbilitiesDropHandler } from "../utils/spellsAbilitiesDropHandler.js";

const BaseSheet = getBaseOSECharacterSheetClass() as typeof foundry.appv1.sheets.ActorSheet;
const TAB_GROUP = "dolmenwood-sheet-tabs";
const TAB_NAV_SELECTOR = ".dolmenwood-sheet__tabs";
const TAB_CONTENT_SELECTOR = ".dolmenwood-sheet__content";

export class DolmenwoodSheet extends BaseSheet {
  private readonly flagsRepository: DwFlagsRepository;
  private readonly formDataHandler: FormDataHandler;

  constructor(...args: ConstructorParameters<typeof BaseSheet>) {
    super(...args);
    this.flagsRepository = new DwFlagsRepository(this.actor);
    this.formDataHandler = new FormDataHandler(this.flagsRepository, this.actor);
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
      getDwFlags: () => this.flagsRepository.get(),
      setDwFlags: (dw) => this.flagsRepository.set(dw)
    });
  }

  protected override async _onDropItem(
    event: DragEvent,
    data: ActorSheet.DropData.Item
  ): Promise<unknown> {
    return SpellsAbilitiesDropHandler.handleDrop({
      event,
      data,
      onAcceptedDrop: (dropEvent, dropData) => super._onDropItem(dropEvent, dropData),
      localize: this.localize
    });
  }

  async _updateObject(event: Event, formData: Record<string, unknown>): Promise<void> {
    const processedData = await this.formDataHandler.handleFormData(formData);

    await super._updateObject(event, processedData);
  }

  private readonly localize = (key: string): string => game.i18n?.localize(key) ?? key;
}
