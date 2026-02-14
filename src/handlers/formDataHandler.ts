import { normalizeDwFlags } from "../utils/normalizeDwFlags.js";
import type { DwFlagsRepository } from "../repositories/dwFlagsRepository.js";
import type { DwFlags } from "../types.js";
import { OseCharacterSheetAdapter } from "../adapters/oseCharacterSheetAdapter.js";
import { MODULE_ID } from "../constants/moduleId.js";

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

    const dwPatch = this.extractDwFromForm(expanded);

    if (dwPatch && typeof dwPatch === "object") {
      const currentDw = this.getCurrentDwFlags();
      const mergedDw = this.mergeDwPatch(currentDw, dwPatch as Record<string, unknown>);
      const normalized = normalizeDwFlags(mergedDw as Partial<DwFlags>);

      await this.flagsRepository.set(normalized);
    }

    delete expanded.dw;
    this.removeModuleDwFlags(expanded);

    return foundry.utils.flattenObject(expanded) as Record<string, unknown>;
  }

  private getCurrentDwFlags(): Record<string, unknown> {
    const current = this.flagsRepository.get();

    if (!current || typeof current !== "object") return {};

    return foundry.utils.duplicate(current) as Record<string, unknown>;
  }

  private mergeDwPatch(
    current: Record<string, unknown>,
    patch: Record<string, unknown>
  ): Record<string, unknown> {
    const merged = foundry.utils.duplicate(current) as Record<string, unknown>;
    const flattenedPatch = foundry.utils.flattenObject(
      foundry.utils.duplicate(patch) as Record<string, unknown>
    ) as Record<string, unknown>;

    for (const [path, value] of Object.entries(flattenedPatch)) {
      foundry.utils.setProperty(merged, path, value);
    }

    return merged;
  }

  private extractDwFromForm(expanded: Record<string, unknown> & { dw?: unknown }): unknown {
    const fromDw = expanded.dw;
    const flagsRoot = expanded.flags;

    if (!flagsRoot || typeof flagsRoot !== "object") return fromDw;

    const moduleFlags = (flagsRoot as Record<string, unknown>)[MODULE_ID];

    if (!moduleFlags || typeof moduleFlags !== "object") return fromDw;

    const fromFlags = (moduleFlags as Record<string, unknown>).dw;

    if (!fromDw) return fromFlags;

    if (!fromFlags || typeof fromFlags !== "object") return fromDw;

    if (typeof fromDw !== "object") return fromDw;

    const merged = foundry.utils.duplicate(fromDw) as Record<string, unknown>;
    const flattenedFlags = foundry.utils.flattenObject(
      foundry.utils.duplicate(fromFlags) as Record<string, unknown>
    ) as Record<string, unknown>;

    for (const [path, value] of Object.entries(flattenedFlags)) {
      foundry.utils.setProperty(merged, path, value);
    }

    return merged;
  }

  private removeModuleDwFlags(expanded: Record<string, unknown> & { flags?: unknown }): void {
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
