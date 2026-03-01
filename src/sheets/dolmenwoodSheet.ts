import { MODULE_ID } from "../constants/moduleId.js";
import { flushActiveFieldBeforeClose } from "../handlers/sheetCloseHandler.js";
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

  // Wire sheet-level collaborators once; runtime read/write flow uses these helpers afterwards.
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

  // Configure the Foundry shell around this sheet; persistence is handled by the custom listeners below.
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

  // Read path: assemble the full view model from the Actor source of truth before rendering.
  getData(options?: Partial<ActorSheet.Options>): DwSheetData {
    const data = super.getData(options) as DwSheetData;

    return DolmenwoodSheetData.populate(data, this.actor);
  }

  // Connect DOM events to the shared write path: field changes and domain actions both end in actor.update.
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

  // Emulate submit-on-close for the current change-driven architecture before delegating to Foundry.
  override async close(options?: Application.CloseOptions): Promise<void> {
    const form = this.form;

    await flushActiveFieldBeforeClose({
      form: form instanceof HTMLFormElement ? form : null,
      getUpdateChain: () => this.updateChain
    });

    await super.close(options);
  }

  // Guard item drops for the spells/abilities area, then forward valid drops to the base OSE sheet.
  protected override async _onDropItem(
    event: DragEvent,
    data: ActorSheet.DropData.Item
  ): Promise<unknown> {
    return this.dropHandler.handleItemDrop(event, data, {
      forwardDrop: () => super._onDropItem(event, data)
    });
  }

  // Single write gateway: skip no-ops, serialize writes, and commit patches to the Actor store.
  private async commitActorUpdate(updatePayload: Record<string, unknown>): Promise<void> {
    if (Object.keys(updatePayload).length === 0) return;

    this.updateChain = this.updateChain
      .catch(() => {})
      .then(async () => {
        await this.actor.update(updatePayload);
      });

    await this.updateChain;
  }

  // Keep localization access injectable for drop handling and other small sheet services.
  private readonly localize = (key: string): string => game.i18n?.localize(key) ?? key;
}
