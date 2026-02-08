import { normalizeDwFlags } from "../utils/normalizeDwFlags.js";
import type { DwFlagsRepository } from "../repositories/dwFlagsRepository.js";
import type { DwFlags } from "../types.js";

export class FormDataHandler {
  constructor(private readonly flagsRepository: DwFlagsRepository) {}

  async handleFormData(formData: Record<string, unknown>): Promise<Record<string, unknown>> {
    const expanded = foundry.utils.expandObject(formData) as Record<string, unknown> & {
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
