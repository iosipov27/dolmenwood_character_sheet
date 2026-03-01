import type { DwFlags, DwSheetData, DwSkillEntry } from "../types.js";
import type { DwLocalize } from "./localize.js";

export function buildDwSkillsList(dw: DwFlags, localize: DwLocalize): DwSheetData["dwSkillsList"] {
  const extras = Array.isArray(dw.extraSkills) ? dw.extraSkills : [];
  const fixedSkills: DwSkillEntry[] = [
    {
      kind: "fixed",
      key: "listen",
      label: localize("DOLMENWOOD.Skills.Listen"),
      value: dw.skills.listen
    },
    {
      kind: "fixed",
      key: "search",
      label: localize("DOLMENWOOD.Skills.Search"),
      value: dw.skills.search
    },
    {
      kind: "fixed",
      key: "survival",
      label: localize("DOLMENWOOD.Skills.Survival"),
      value: dw.skills.survival
    }
  ];

  return [
    ...fixedSkills,
    ...extras.map(
      (skill, index): DwSkillEntry => ({
        kind: "extra",
        index,
        name: skill?.name ?? "",
        target: Number(skill?.target ?? 6)
      })
    )
  ];
}
