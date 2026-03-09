import { MODULE_ID } from "../constants/moduleId.js";
import { SheetDropHandler } from "../handlers/sheetDropHandler.js";
import { buildDwUpdatePayload } from "../handlers/sheetUpdateBuilder.js";
import { registerSheetListeners } from "../listeners/registerSheetListeners.js";
import { buildDwFlagsFromActor } from "../models/buildDwFlagsFromActor.js";
import { DolmenwoodSheetData } from "../models/dolmenwoodSheetData.js";
import type { DwSheetData, HtmlRoot } from "../types/index.js";
import { OseCharacterSheetAdapter } from "../adapters/oseCharacterSheetAdapter.js";
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

  // Configure the Foundry shell around this sheet; form fields submit through ActorSheet's native pipeline.
  static get defaultOptions(): ActorSheet.Options {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["dolmenwood", "sheet", "actor"],
      template: `modules/${MODULE_ID}/templates/dolmenwood.hbs`,
      width: 640,
      height: 730,
      closeOnSubmit: false,
      submitOnClose: true,
      submitOnChange: true,
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

  // Connect domain actions that do not flow through the form submission lifecycle.
  activateListeners(html: HtmlRoot): void {
    super.activateListeners(html);

    this.registerAvatarEditHandler(html);

    registerSheetListeners(html, {
      actor: this.actor,
      getDwFlags: () => buildDwFlagsFromActor(this.actor),
      applyDwPatch: async (dwPatch) => {
        await this.commitActorUpdate(buildDwUpdatePayload(this.actor, dwPatch));
      }
    });
  }

  override async _updateObject(event: Event, formData: Record<string, unknown>): Promise<void> {
    const updatePayload = this.buildSubmitUpdatePayload(formData);

    await this.commitActorUpdate(updatePayload);
  }

  private registerAvatarEditHandler(html: HtmlRoot): void {
    html.on("click", "img[data-edit='img']", async (event) => {
      if (!this.isEditable) return;

      const image = event.currentTarget as HTMLImageElement | null;
      if (!(image instanceof HTMLImageElement)) return;

      event.preventDefault();

      const PickerConstructor =
        foundry.applications?.apps?.FilePicker.implementation ??
        foundry.applications?.apps?.FilePicker;

      if (!PickerConstructor) return;

      const picker = new PickerConstructor({
        type: "image",
        current: image.getAttribute("src") ?? "",
        callback: (path: string) => {
          void this.commitActorUpdate({ img: path });
        }
      });

      await picker.render(true);
    });
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

  private buildSubmitUpdatePayload(formData: Record<string, unknown>): Record<string, unknown> {
    const remappedFormData = OseCharacterSheetAdapter.remapDerivedArmorClassEdits(
      { ...formData },
      this.actor
    );
    const expanded = foundry.utils.expandObject(remappedFormData) as Record<string, unknown> & {
      dw?: unknown;
      flags?: unknown;
    };
    const dwPatch = this.extractDwPatch(expanded);

    this.stripDwPayload(expanded);

    const actorUpdatePayload = foundry.utils.flattenObject(expanded) as Record<string, unknown>;

    if (!dwPatch) return actorUpdatePayload;

    return {
      ...actorUpdatePayload,
      ...buildDwUpdatePayload(this.actor, dwPatch)
    };
  }

  private extractDwPatch(
    expanded: Record<string, unknown> & { dw?: unknown; flags?: unknown }
  ): Record<string, unknown> | null {
    const fromDw = expanded.dw;
    const fromFlags = this.getModuleDwFromFlags(expanded.flags);
    let patch: Record<string, unknown> | null = null;

    if (fromDw && typeof fromDw === "object") {
      patch = foundry.utils.duplicate(fromDw) as Record<string, unknown>;
    }

    if (fromFlags && typeof fromFlags === "object") {
      patch ??= {};

      const flattenedFlags = foundry.utils.flattenObject(
        foundry.utils.duplicate(fromFlags) as Record<string, unknown>
      ) as Record<string, unknown>;

      for (const [path, value] of Object.entries(flattenedFlags)) {
        foundry.utils.setProperty(patch, path, value);
      }
    }

    return patch;
  }

  private getModuleDwFromFlags(flags: unknown): unknown {
    if (!flags || typeof flags !== "object") return undefined;

    const moduleFlags = (flags as Record<string, unknown>)[MODULE_ID];

    if (!moduleFlags || typeof moduleFlags !== "object") return undefined;

    return (moduleFlags as Record<string, unknown>).dw;
  }

  private stripDwPayload(expanded: Record<string, unknown> & { flags?: unknown }): void {
    delete expanded.dw;

    if (!expanded.flags || typeof expanded.flags !== "object") return;

    const flagsRoot = expanded.flags as Record<string, unknown>;
    const moduleFlags = flagsRoot[MODULE_ID];

    if (!moduleFlags || typeof moduleFlags !== "object") return;

    const moduleFlagsRecord = moduleFlags as Record<string, unknown>;

    delete moduleFlagsRecord.dw;

    if (Object.keys(moduleFlagsRecord).length === 0) {
      delete flagsRoot[MODULE_ID];
    }

    if (Object.keys(flagsRoot).length === 0) {
      delete expanded.flags;
    }
  }

  // Keep localization access injectable for drop handling and other small sheet services.
  private readonly localize = (key: string): string => game.i18n?.localize(key) ?? key;
}
