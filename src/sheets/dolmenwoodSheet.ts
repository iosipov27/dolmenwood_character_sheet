import { MODULE_ID } from "../constants/moduleId.js";
import { TabController } from "../controllers/tabController.js";
import { FormDataHandler } from "../handlers/formDataHandler.js";
import { registerSheetListeners } from "../listeners/registerSheetListeners.js";
import { registerTabNavigationListener } from "../listeners/registerTabNavigationListener.js";
import { DolmenwoodSheetData } from "../models/dolmenwoodSheetData.js";
import { DwFlagsRepository } from "../repositories/dwFlagsRepository.js";
import type { DwSheetData, HtmlRoot } from "../types.js";
import { getBaseOSECharacterSheetClass } from "../utils/getBaseOSECharacterSheetClass.js";

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
      setDwFlags: (dw) => this.persistSheetChanges({ dwPatch: dw })
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

  async _updateObject(event: Event, formData: Record<string, unknown>): Promise<void> {
    await this.persistSheetChanges({ event, formData });
  }

  private async persistSheetChanges({
    event,
    formData,
    dwPatch
  }: {
    event?: Event;
    formData?: Record<string, unknown>;
    dwPatch?: object;
  }): Promise<void> {
    if (!formData && !dwPatch) return;

    let updatePayload: Record<string, unknown>;

    if (formData) {
      updatePayload = await this.formDataHandler.handleFormData(formData);
    } else if (dwPatch) {
      updatePayload = await this.formDataHandler.handleDwPatch(dwPatch);
    } else {
      return;
    }

    if (Object.keys(updatePayload).length === 0) return;

    if (event) {
      await super._updateObject(event, updatePayload);

      return;
    }

    await this.actor.update(updatePayload);
  }

  private isDropInsideSpellsAbilitiesTab(event: DragEvent): boolean {
    const targetElement = this.getDropTargetElement(event);

    if (!targetElement) return false;

    return Boolean(targetElement.closest("[data-tab-panel='spells-abilities']"));
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
