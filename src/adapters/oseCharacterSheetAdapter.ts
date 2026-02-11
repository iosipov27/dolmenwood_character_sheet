/**
 * OseCharacterSheetAdapter
 * ------------------------
 * Single integration point for OSE-specific sheet data behavior.
 *
 * If this module needs to stop relying on OSE internals, change/remove logic here
 * and keep the rest of the sheet code untouched.
 */
export class OseCharacterSheetAdapter {
  static getArmorClassCandidates(systemData: Record<string, unknown>): string[] {
    const wrapper: { system: Record<string, unknown> } = { system: systemData };
    const usesAscendingAc = Boolean(foundry.utils.getProperty(wrapper, "system.usesAscendingAC"));

    return usesAscendingAc
      ? [
        // OSE character AC (ascending mode)
        "system.aac.value",
        "system.aac.current",
        "system.aac",
        // OSE character AC (descending mode fallback)
        "system.ac.value",
        "system.ac.current",
        "system.ac",
        // Legacy / generic paths
        "system.attributes.aac.value",
        "system.attributes.aac.current",
        "system.attributes.aac",
        "system.attributes.ac.value",
        "system.attributes.ac.current",
        "system.attributes.ac"
      ]
      : [
        // OSE character AC (descending mode)
        "system.ac.value",
        "system.ac.current",
        "system.ac",
        // OSE character AC (ascending mode fallback)
        "system.aac.value",
        "system.aac.current",
        "system.aac",
        // Legacy / generic paths
        "system.attributes.ac.value",
        "system.attributes.ac.current",
        "system.attributes.ac",
        "system.attributes.aac.value",
        "system.attributes.aac.current",
        "system.attributes.aac"
      ];
  }

  static remapDerivedArmorClassEdits(
    formData: Record<string, unknown>,
    actor: Actor
  ): Record<string, unknown> {
    const next = { ...formData };

    this.remapDerivedAcValueToMod(next, actor, "system.ac", false);
    this.remapDerivedAcValueToMod(next, actor, "system.aac", true);

    return next;
  }

  private static remapDerivedAcValueToMod(
    formData: Record<string, unknown>,
    actor: Actor,
    acRoot: "system.ac" | "system.aac",
    isAscending: boolean
  ): void {
    const valuePath = `${acRoot}.value`;
    const modPath = `${acRoot}.mod`;

    if (!(valuePath in formData)) return;

    const desiredValue = this.toFiniteNumber(formData[valuePath]);
    const currentValue = this.toFiniteNumber(foundry.utils.getProperty(actor, valuePath));
    const currentMod = this.toFiniteNumber(foundry.utils.getProperty(actor, modPath));

    if (desiredValue === null || currentValue === null || currentMod === null) return;

    const nextMod = isAscending
      ? currentMod + desiredValue - currentValue
      : currentMod + currentValue - desiredValue;

    formData[modPath] = nextMod;
    delete formData[valuePath];
  }

  private static toFiniteNumber(value: unknown): number | null {
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
