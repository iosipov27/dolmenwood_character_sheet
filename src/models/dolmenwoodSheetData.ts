import { MODULE_ID } from "../constants/moduleId.js";
import { SAVE_TOOLTIPS } from "../constants/saveTooltips.js";
import { SKILL_TOOLTIPS } from "../constants/skillTooltips.js";
import { dwDefaults } from "../models/dwDefaults.js";
import { normalizeDwFlags } from "../utils/normalizeDwFlags.js";
import { prettyKey } from "../utils/prettyKey.js";
import { buildAbilities } from "../utils/buildAbilities.js";
import { buildCombat } from "../utils/buildCombat.js";
import { buildHp } from "../utils/buildHp.js";
import type { DwSheetData, DwExtraSkill, DwSkillEntry } from "../types.js";

export class DolmenwoodSheetData {
  static populate(data: DwSheetData, actor: Actor): DwSheetData {
    const moduleRegistry = game?.modules as Collection<Module> | undefined;
    const moduleActive = moduleRegistry?.get(MODULE_ID)?.active;

    // OSE system data.
    data.system = (actor.system as Record<string, unknown>) ?? {};

    // Dolmenwood flags (actor.flags.<module>.dw).
    let dwFlagRaw: Partial<Record<string, unknown>> = {};

    try {
      if (moduleActive) {
        dwFlagRaw =
          ((actor as any).getFlag?.(MODULE_ID, "dw") as Partial<Record<string, unknown>>) ?? {};
      }
    } catch {
      // Silently ignore flag read errors
    }

    const dwFlag = normalizeDwFlags(dwFlagRaw);

    // Merge defaults with stored flags.
    data.dw = foundry.utils.mergeObject(dwDefaults(), dwFlag, { inplace: false });

    // Skills (fixed + extra).
    const extras = Array.isArray(data.dw.extraSkills) ? data.dw.extraSkills : [];

    data.dwSkillsList = [
      { kind: "fixed", key: "listen", label: "LISTEN", value: data.dw.skills.listen },
      { kind: "fixed", key: "search", label: "SEARCH", value: data.dw.skills.search },
      { kind: "fixed", key: "survival", label: "SURVIVAL", value: data.dw.skills.survival },
      ...extras.map(
        (s: DwExtraSkill, i: number): DwSkillEntry => ({
          kind: "extra",
          index: i,
          name: s?.name ?? "",
          target: Number(s?.target ?? 0)
        })
      )
    ];

    // UI helpers for the template.
    data.dwUi = {
      saveTooltips: SAVE_TOOLTIPS,
      skillTooltips: SKILL_TOOLTIPS,
      prettyKey
    };

    // Abilities from OSE system data.
    data.dwAbilities = buildAbilities(actor.system as Record<string, unknown>);

    // AC and Attack (read from OSE system data)
    data.dwCombat = buildCombat(actor.system as Record<string, unknown>);

    // HP from OSE system data.
    data.dwHp = buildHp(actor.system as Record<string, unknown>);

    // Save targets list (labels, rollable, order).
    data.dwSavesList = [
      { key: "doom", label: "DOOM", rollable: true, value: data.dw.saves.doom },
      { key: "hold", label: "HOLD", rollable: true, value: data.dw.saves.hold },
      { key: "spell", label: "SPELL", rollable: true, value: data.dw.saves.spell },
      { key: "ray", label: "RAY", rollable: true, value: data.dw.saves.ray },
      { key: "blast", label: "BLAST", rollable: true, value: data.dw.saves.blast },
      { key: "magic", label: "MAGIC/RESIST", rollable: false, value: data.dw.saves.magic }
    ];

    return data;
  }
}
