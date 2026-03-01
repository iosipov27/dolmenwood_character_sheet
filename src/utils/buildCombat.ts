/**
 * buildCombat()
 * -------------
 * Tries to detect common OSE-like paths for:
 * - Armor Class (AC)
 * - Attack bonus (Attack)
 *
 * Returns UI-friendly structure with:
 * - detected values
 * - form field names (for editing where supported)
 */
import type { DwCombatView } from "../types.js";
import { OseCharacterSheetAdapter } from "../adapters/oseCharacterSheetAdapter.js";

export function buildCombat(systemData: Record<string, unknown>): DwCombatView {
  const wrapper: { system: Record<string, unknown> } = { system: systemData };
  const acCandidates = OseCharacterSheetAdapter.getArmorClassCandidates(systemData);

  const atkCandidates = [
    // Common for OSE-like systems
    "system.attributes.attack.value",
    "system.attributes.attack.bonus",
    "system.attributes.attack",
    "system.attack.value",
    "system.attack.bonus",
    "system.attack"
  ];

  const detectNumberPath = (candidates: string[]): string | null => {
    for (const p of candidates) {
      const v = foundry.utils.getProperty(wrapper, p);

      if (typeof v === "number") return p;
    }

    return null;
  };

  const acPath = detectNumberPath(acCandidates);
  const atkPath = detectNumberPath(atkCandidates);

  const ac = acPath ? (foundry.utils.getProperty(wrapper, acPath) as number) : null;
  const attack = atkPath ? (foundry.utils.getProperty(wrapper, atkPath) as number) : null;

  return {
    ac,
    attack,
    nameAc: acPath ?? "",
    nameAttack: atkPath ?? "",
    hasAc: Boolean(acPath),
    hasAttack: Boolean(atkPath)
  };
}
