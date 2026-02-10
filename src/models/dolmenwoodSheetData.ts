import { MODULE_ID } from "../constants/moduleId.js";
import { SAVE_TOOLTIPS } from "../constants/saveTooltips.js";
import { SKILL_TOOLTIPS } from "../constants/skillTooltips.js";
import { dwDefaults } from "../models/dwDefaults.js";
import { normalizeDwFlags } from "../utils/normalizeDwFlags.js";
import { prettyKey } from "../utils/prettyKey.js";
import { buildAbilities } from "../utils/buildAbilities.js";
import { buildCombat } from "../utils/buildCombat.js";
import { buildHp } from "../utils/buildHp.js";
import { reportError } from "../utils/reportError.js";
import type { DwEquipmentFieldEntry, DwSheetData, DwExtraSkill, DwSkillEntry } from "../types.js";

export class DolmenwoodSheetData {
  static populate(data: DwSheetData, actor: Actor): DwSheetData {
    const localize = (key: string): string => game.i18n?.localize(key) ?? key;
    const localizeMap = (map: Record<string, string>): Record<string, string> =>
      Object.fromEntries(Object.entries(map).map(([k, v]) => [k, localize(v)]));
    const moduleRegistry = game?.modules as Collection<Module> | undefined;
    const moduleActive = moduleRegistry?.get(MODULE_ID)?.active;

    // OSE system data.
    data.system = (actor.system as Record<string, unknown>) ?? {};

    // Dolmenwood flags (actor.flags.<module>.dw).
    let dwFlagRaw: Partial<Record<string, unknown>> = {};

    try {
      if (moduleActive) {
        const actorWithFlags = actor as Actor & {
          getFlag?(scope: string, key: string): unknown;
        };

        dwFlagRaw =
          (actorWithFlags.getFlag?.(MODULE_ID, "dw") as Partial<Record<string, unknown>>) ?? {};
      }
    } catch (error) {
      reportError("Failed to read dolmenwood flags while building sheet data.", error);
    }

    const dwFlag = normalizeDwFlags(dwFlagRaw);

    // Merge defaults with stored flags.
    data.dw = foundry.utils.mergeObject(dwDefaults(), dwFlag, { inplace: false });

    // Skills (fixed + extra).
    const extras = Array.isArray(data.dw.extraSkills) ? data.dw.extraSkills : [];

    const prettyKeyMap = Object.fromEntries(
      Object.keys(data.dw.skills).map((key) => [key, prettyKey(key)])
    );
    const equipment = data.dw.meta.equipment;
    const buildEquipmentField = (
      prefix: "equipped" | "stowed",
      index: number
    ): DwEquipmentFieldEntry => {
      const key = `${prefix}${index}` as keyof typeof equipment;
      const weightKey = `${prefix}Weight${index}` as keyof typeof equipment;
      const value = String(equipment[key] ?? "");
      const weightValue = String(equipment[weightKey] ?? "");

      return {
        id: `dw-${prefix}-${index}`,
        name: `dw.meta.equipment.${prefix}${index}`,
        value,
        placeholder: `Item ${index}`,
        weightId: `dw-${prefix}-weight-${index}`,
        weightName: `dw.meta.equipment.${prefix}Weight${index}`,
        weightValue
      };
    };
    const equippedFields = Array.from({ length: 10 }, (_, i) => buildEquipmentField("equipped", i + 1));
    const stowedFields = Array.from({ length: 16 }, (_, i) => buildEquipmentField("stowed", i + 1));

    data.dwSkillsList = [
      {
        kind: "fixed",
        key: "listen",
        label: localize("DOLMENWOOD.Skills.Listen"),
        value: data.dw.skills.listen
      },
      {
        kind: "fixed",
        key: "search",
        label: localize("DOLMENWOOD.Skills.Search"),
        value: data.dw.skills.search
      },
      {
        kind: "fixed",
        key: "survival",
        label: localize("DOLMENWOOD.Skills.Survival"),
        value: data.dw.skills.survival
      },
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
      saveTooltips: localizeMap(SAVE_TOOLTIPS),
      skillTooltips: localizeMap(SKILL_TOOLTIPS),
      prettyKey: prettyKeyMap,
      equipment: {
        equippedFields,
        stowedFields
      }
    };

    // Abilities from OSE system data.
    data.dwAbilities = buildAbilities(actor.system as Record<string, unknown>);

    // AC and Attack (read from OSE system data)
    data.dwCombat = buildCombat(actor.system as Record<string, unknown>);

    // HP from OSE system data.
    data.dwHp = buildHp(actor.system as Record<string, unknown>);

    // Save targets list (labels, rollable, order).
    data.dwSavesList = [
      {
        key: "doom",
        label: localize("DOLMENWOOD.Saves.Doom"),
        rollable: true,
        value: data.dw.saves.doom
      },
      {
        key: "hold",
        label: localize("DOLMENWOOD.Saves.Hold"),
        rollable: true,
        value: data.dw.saves.hold
      },
      {
        key: "spell",
        label: localize("DOLMENWOOD.Saves.Spell"),
        rollable: true,
        value: data.dw.saves.spell
      },
      {
        key: "ray",
        label: localize("DOLMENWOOD.Saves.Ray"),
        rollable: true,
        value: data.dw.saves.ray
      },
      {
        key: "blast",
        label: localize("DOLMENWOOD.Saves.Blast"),
        rollable: true,
        value: data.dw.saves.blast
      },
      {
        key: "magic",
        label: localize("DOLMENWOOD.Saves.MagicResist"),
        rollable: false,
        value: data.dw.saves.magic
      }
    ];

    return data;
  }
}
