import { normalizeDwFlags } from "../utils/normalizeDwFlags.js";
import type { DwFlagsRepository } from "../repositories/dwFlagsRepository.js";
import type { DwFlags } from "../types.js";
import { OseCharacterSheetAdapter } from "../adapters/oseCharacterSheetAdapter.js";

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
    };

    if ("dw" in expanded && expanded.dw) {
      const normalized = normalizeDwFlags(expanded.dw as Partial<DwFlags>);

      await this.flagsRepository.set(normalized);
    }

    delete expanded.dw;

    return foundry.utils.flattenObject(expanded) as Record<string, unknown>;
  }
}
