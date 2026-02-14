import { MODULE_ID } from "../constants/moduleId.js";
import { DolmenwoodSheetData } from "../models/dolmenwoodSheetData.js";
import type { HtmlRoot, DwSheetData } from "../types.js";
import { registerSheetListeners } from "../listeners/registerSheetListeners.js";
import { registerTabNavigationListener } from "../listeners/registerTabNavigationListener.js";
import { getBaseOSECharacterSheetClass } from "../utils/getBaseOSECharacterSheetClass.js";
import { DwFlagsRepository } from "../repositories/dwFlagsRepository.js";
import { TabController } from "../controllers/tabController.js";
import { FormDataHandler } from "../handlers/formDataHandler.js";

const BaseSheet = getBaseOSECharacterSheetClass() as typeof foundry.appv1.sheets.ActorSheet;

export class DolmenwoodSheet extends BaseSheet {
  private readonly tabController: TabController;
  private readonly flagsRepository: DwFlagsRepository;
  private readonly formDataHandler: FormDataHandler;

  constructor(...args: ConstructorParameters<typeof BaseSheet>) {
    super(...args);
    this.tabController = new TabController();
    this.flagsRepository = new DwFlagsRepository(this.actor);
    this.formDataHandler = new FormDataHandler(this.flagsRepository, this.actor);
  }

  static get defaultOptions(): ActorSheet.Options {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["dolmenwood", "sheet", "actor"],
      template: `modules/${MODULE_ID}/templates/dolmenwood.hbs`,
      width: 640,
      height: 730,
      closeOnSubmit: false,
      submitOnClose: true,
      submitOnChange: true,
      resizable: true
    });
  }

  getData(options?: Partial<ActorSheet.Options>): DwSheetData {
    const data = super.getData(options) as DwSheetData;

    return DolmenwoodSheetData.populate(data, this.actor);
  }

  activateListeners(html: HtmlRoot): void {
    super.activateListeners(html);

    registerTabNavigationListener(html, {
      getActiveTab: () => this.tabController.getActiveTab(),
      setActiveTab: (tab: string) => this.tabController.setActiveTab(tab)
    });

    registerSheetListeners(html, {
      actor: this.actor,
      getDwFlags: () => this.flagsRepository.get(),
      setDwFlags: (dw) => this.flagsRepository.set(dw)
    });
  }

  async _updateObject(event: Event, formData: Record<string, unknown>): Promise<void> {
    const processedData = await this.formDataHandler.handleFormData(formData);

    await super._updateObject(event, processedData);
  }
}
