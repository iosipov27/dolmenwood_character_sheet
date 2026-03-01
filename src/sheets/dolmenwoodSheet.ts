import { MODULE_ID } from "../constants/moduleId.js";
import { SheetDropHandler } from "../handlers/sheetDropHandler.js";
import { buildDwUpdatePayload, buildFieldUpdatePayload } from "../handlers/sheetUpdateBuilder.js";
import { registerFormChangeListener } from "../listeners/registerFormChangeListener.js";
import { registerSheetListeners } from "../listeners/registerSheetListeners.js";
import { buildDwFlagsFromActor } from "../models/buildDwFlagsFromActor.js";
import { DolmenwoodSheetData } from "../models/dolmenwoodSheetData.js";
import type { DwSheetData, HtmlRoot } from "../types/index.js";
import { getBaseOSECharacterSheetClass } from "../utils/getBaseOSECharacterSheetClass.js";

const BaseSheet = getBaseOSECharacterSheetClass() as typeof foundry.appv1.sheets.ActorSheet;

export class DolmenwoodSheet extends BaseSheet {
  private readonly dropHandler: SheetDropHandler;
  private updateChain: Promise<void> = Promise.resolve();

  constructor(...args: ConstructorParameters<typeof BaseSheet>) {
    super(...args);
    this.dropHandler = new SheetDropHandler({
      fromDropData: async (data) => (await Item.fromDropData(data)) ?? null,
      localize: this.localize,
      warn: (message) => {
        ui.notifications?.warn(message);
      }
    });
  }

  static get defaultOptions(): ActorSheet.Options {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["dolmenwood", "sheet", "actor"],
      template: `modules/${MODULE_ID}/templates/dolmenwood.hbs`,
      width: 640,
      height: 730,
      closeOnSubmit: false,
      // Native submit-on-close is disabled; close() flushes the active field and waits for queued updates.
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
        await this.commitActorUpdate(buildFieldUpdatePayload(this.actor, name, value));
      }
    });

    registerSheetListeners(html, {
      actor: this.actor,
      getDwFlags: () => buildDwFlagsFromActor(this.actor),
      applyDwPatch: async (dwPatch) => {
        await this.commitActorUpdate(buildDwUpdatePayload(this.actor, dwPatch));
      }
    });
  }

  override async close(options?: Application.CloseOptions): Promise<void> {
    await this.flushActiveFieldBeforeClose();

    await super.close(options);
  }

  protected override async _onDropItem(
    event: DragEvent,
    data: ActorSheet.DropData.Item
  ): Promise<unknown> {
    return this.dropHandler.handleItemDrop(event, data, {
      forwardDrop: () => super._onDropItem(event, data)
    });
  }

  private async commitActorUpdate(updatePayload: Record<string, unknown>): Promise<void> {
    if (Object.keys(updatePayload).length === 0) return;

    this.updateChain = this.updateChain
      .catch(() => {})
      .then(async () => {
        await this.actor.update(updatePayload);
      });

    await this.updateChain;
  }

  private async flushActiveFieldBeforeClose(): Promise<void> {
    const form = this.form;

    if (!(form instanceof HTMLFormElement)) return;

    const activeElement = form.ownerDocument?.activeElement;

    if (!(activeElement instanceof HTMLElement) || !form.contains(activeElement)) return;

    activeElement.blur();

    await Promise.resolve();
    await this.updateChain.catch(() => {});
  }

  private readonly localize = (key: string): string => game.i18n?.localize(key) ?? key;
}
