import { cleanDwFlagsWithSchema } from "../models/dwSchema.js";
import { readDwFlags, writeDwFlags } from "../repositories/dwFlagsRepository.js";
import { OseCharacterSheetAdapter } from "../adapters/oseCharacterSheetAdapter.js";
import { MODULE_ID } from "../constants/moduleId.js";

export class FormDataHandler {
  constructor(private readonly actor: Actor) {}

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

    if (dwPatch) {
      const mergedDw = this.mergeWithCurrentDw(dwPatch);
      const cleanedDw = cleanDwFlagsWithSchema(mergedDw);

      if (cleanedDw) {
        await writeDwFlags(this.actor, cleanedDw);
      }
    }

    this.stripDwPayload(expanded);

    return foundry.utils.flattenObject(expanded) as Record<string, unknown>;
  }

  private mergeWithCurrentDw(dwPatch: Record<string, unknown>): Record<string, unknown> {
    const current = readDwFlags(this.actor);
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
}
