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

export function buildCombat(systemData: Record<string, unknown>): DwCombatView {
  const wrapper: { system: Record<string, unknown> } = { system: systemData };
  const usesAscendingAc = Boolean(foundry.utils.getProperty(wrapper, "system.usesAscendingAC"));

  const acCandidates = usesAscendingAc
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
