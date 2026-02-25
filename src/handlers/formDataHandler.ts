import { cleanDwFlagsWithSchema } from "../models/dwSchema.js";
import type { DwFlagsRepository } from "../repositories/dwFlagsRepository.js";
import { OseCharacterSheetAdapter } from "../adapters/oseCharacterSheetAdapter.js";
import { MODULE_ID } from "../constants/moduleId.js";
import type { DwFlags } from "../types.js";

export class FormDataHandler {
  constructor(
    private readonly flagsRepository: DwFlagsRepository,
    private readonly actor: Actor
  ) {}

  async handleFormData(formData: Record<string, unknown>): Promise<Record<string, unknown>> {
    const remappedFormData = OseCharacterSheetAdapter.remapDerivedArmorClassEdits(
      formData,
      this.actor
    );
    const expanded = foundry.utils.expandObject(remappedFormData) as Record<string, unknown> & {
      dw?: unknown;
      flags?: unknown;
    };
    const dwPatch = this.extractDwPatch(expanded);

    this.stripDwPayload(expanded);

    const actorUpdate = foundry.utils.flattenObject(expanded) as Record<string, unknown>;
    const cleanedDw = this.buildCleanDw(dwPatch);

    if (cleanedDw) {
      actorUpdate[`flags.${MODULE_ID}.dw`] = cleanedDw;
    }

    return actorUpdate;
  }

  async handleDwPatch(dwPatch: object): Promise<Record<string, unknown>> {
    const cleanedDw = this.buildCleanDw(dwPatch);

    if (!cleanedDw) return {};

    return {
      [`flags.${MODULE_ID}.dw`]: cleanedDw
    };
  }

  private mergeWithCurrentDw(dwPatch: object): Record<string, unknown> {
    const current = this.flagsRepository.get();
    const merged =
      current && typeof current === "object"
        ? (foundry.utils.duplicate(current) as Record<string, unknown>)
        : {};
    const flattenedPatch = foundry.utils.flattenObject(
      foundry.utils.duplicate(dwPatch) as Record<string, unknown>
    ) as Record<string, unknown>;

    for (const [path, value] of Object.entries(flattenedPatch)) {
      foundry.utils.setProperty(merged, path, value);
    }

    return merged;
  }

  private buildCleanDw(dwPatch: object | null): DwFlags | null {
    if (!dwPatch) return null;

    const mergedDw = this.mergeWithCurrentDw(dwPatch);

    return cleanDwFlagsWithSchema(mergedDw);
  }

  private extractDwPatch(
    expanded: Record<string, unknown> & { dw?: unknown }
  ): object | null {
    const fromDw = expanded.dw;

    if (fromDw && typeof fromDw === "object") {
      return foundry.utils.duplicate(fromDw) as Record<string, unknown>;
    }

    return null;
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
}
