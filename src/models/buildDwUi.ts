import { SAVE_TOOLTIPS } from "../constants/saveTooltips.js";
import { SKILL_TOOLTIPS } from "../constants/skillTooltips.js";
import type { DwFlags, DwSheetView } from "../types/index.js";
import { buildDwEquipmentUi } from "./buildDwEquipmentUi.js";
import type { DwLocalize } from "./localize.js";
import { localizeRecord } from "./localize.js";

export function buildDwUi(
  dw: DwFlags,
  localize: DwLocalize,
  actorName?: string | null
): DwSheetView["ui"] {
  return {
    avatarTooltip: buildAvatarTooltip(dw, localize, actorName),
    saveTooltips: localizeRecord(SAVE_TOOLTIPS, localize),
    skillTooltips: localizeRecord(SKILL_TOOLTIPS, localize),
    equipment: buildDwEquipmentUi(dw.meta.equipment)
  };
}

function buildAvatarTooltip(dw: DwFlags, localize: DwLocalize, actorName?: string | null): string {
  const xpSummaryLines = [
    [localize("DOLMENWOOD.UI.XP"), dw.meta.xp],
    [localize("DOLMENWOOD.UI.Level"), dw.meta.level],
    [localize("DOLMENWOOD.UI.NextLevel"), dw.meta.nextLevel],
    [localize("DOLMENWOOD.UI.Modifier"), dw.meta.modifier]
  ].map(([label, value]) => `${label}: ${formatTooltipValue(value)}`);

  const trimmedActorName = actorName?.trim();

  return trimmedActorName
    ? [trimmedActorName, ...xpSummaryLines].join("\n")
    : xpSummaryLines.join("\n");
}

function formatTooltipValue(value: unknown): string {
  return value === null || value === undefined || value === "" ? "-" : String(value);
}
