import { normalizeDwFlags } from "../utils/normalizeDwFlags.js";
import type { DwFlagsRepository } from "../repositories/dwFlagsRepository.js";
import type { DwFlags } from "../types.js";

export class FormDataHandler {
  constructor(
    private readonly flagsRepository: DwFlagsRepository,
    private readonly actor: Actor
  ) {}

  async handleFormData(formData: Record<string, unknown>): Promise<Record<string, unknown>> {
    const remappedFormData = this.remapDerivedArmorClassFields(formData);
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

  private remapDerivedArmorClassFields(formData: Record<string, unknown>): Record<string, unknown> {
    const next = { ...formData };

    this.remapDerivedAcValueToMod(next, "system.ac", false);
    this.remapDerivedAcValueToMod(next, "system.aac", true);

    return next;
  }

  private remapDerivedAcValueToMod(
    formData: Record<string, unknown>,
    acRoot: "system.ac" | "system.aac",
    isAscending: boolean
  ): void {
    const valuePath = `${acRoot}.value`;
    const modPath = `${acRoot}.mod`;

    if (!(valuePath in formData)) return;

    const desiredValue = this.toFiniteNumber(formData[valuePath]);
    const currentValue = this.toFiniteNumber(foundry.utils.getProperty(this.actor, valuePath));
    const currentMod = this.toFiniteNumber(foundry.utils.getProperty(this.actor, modPath));

    if (desiredValue === null || currentValue === null || currentMod === null) return;

    const nextMod = isAscending
      ? currentMod + desiredValue - currentValue
      : currentMod + currentValue - desiredValue;

    formData[modPath] = nextMod;
    delete formData[valuePath];
  }

  private toFiniteNumber(value: unknown): number | null {
    if (typeof value === "number") {
      return Number.isFinite(value) ? value : null;
    }

    if (typeof value === "string") {
      const parsed = Number(value);

      return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
  }
}
