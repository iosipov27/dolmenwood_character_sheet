import { ABILITIES } from "../constants/abilities.js";
import { formatSigned } from "./formatSigned.js";
import type { DwAbilityView } from "../types.js";

export function buildAbilities(systemData: Record<string, unknown>): DwAbilityView[] {
  const candidates: Array<(k: string) => string> = [
    (k: string) => `system.abilities.${k}.value`,
    (k: string) => `system.abilities.${k}`,
    (k: string) => `system.stats.${k}.value`,
    (k: string) => `system.stats.${k}`,
    (k: string) => `system.attributes.${k}.value`,
    (k: string) => `system.attributes.${k}`,
    (k: string) => `system.scores.${k}.value`,
    (k: string) => `system.scores.${k}`,
    (k: string) => `system.abilities.${k.toUpperCase()}.value`,
    (k: string) => `system.stats.${k.toUpperCase()}.value`
  ];

  const modCandidates: Array<(base: string) => string> = [
    (base: string) => base.replace(/\.value$/, ".mod"),
    (base: string) => base.replace(/\.value$/, ".modifier"),
    (base: string) => base.replace(/\.value$/, ".bonus"),
    (base: string) => base.replace(/\.value$/, ".bns")
  ];

  const wrapper: { system: Record<string, unknown> } = { system: systemData };
  const out: DwAbilityView[] = [];

  for (const a of ABILITIES) {
    let foundPath: string | null = null;
    let value = 0;

    for (const mk of candidates) {
      const p = mk(a.key);
      const v = foundry.utils.getProperty(wrapper, p);

      if (typeof v === "number") {
        foundPath = p;
        value = v;
        break;
      }
    }

    let mod = 0;
    let hasMod = false;

    if (foundPath && String(foundPath).endsWith(".value")) {
      for (const mm of modCandidates) {
        const mp = mm(foundPath);
        const mv = foundry.utils.getProperty(wrapper, mp);

        if (typeof mv === "number") {
          mod = mv;
          hasMod = true;
          break;
        }
      }
    }

    out.push({
      key: a.key,
      label: a.label,
      title: a.title,
      value,
      name: foundPath ?? "",
      hasPath: Boolean(foundPath),
      mod,
      hasMod,
      modText: hasMod ? formatSigned(mod) : ""
    });
  }

  return out;
}
