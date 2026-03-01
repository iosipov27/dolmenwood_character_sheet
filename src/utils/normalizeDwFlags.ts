import type { DwFlags, DwFlagsInput, DwMeta, DwSaves, DwSpellsTraitsView } from "../types/index.js";
import { cleanDwFlagsWithSchema } from "../models/dwSchema.js";
import { reportError } from "./reportError.js";

const SPELLS_TRAITS_VIEW_MODES: readonly DwSpellsTraitsView[] = ["cards", "text", "both"];

function isSpellsTraitsView(value: string): value is DwSpellsTraitsView {
  return SPELLS_TRAITS_VIEW_MODES.includes(value as DwSpellsTraitsView);
}

function normalizeBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (normalized === "true") return true;
    if (normalized === "false" || normalized === "") return false;
  }

  return false;
}

function normalizeNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  if (typeof value === "string") {
    const parsed = Number(value.trim());

    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function normalizeString(value: unknown): string {
  if (typeof value === "string") return value.trim();

  return "";
}

export function normalizeDwFlags(dw: DwFlagsInput): DwFlags {
  // If an old "resistance" existed, fold it into magic (prefer magic if set).
  const d = foundry.utils.duplicate(dw ?? {}) as DwFlagsInput;
  const saves = (d.saves ?? {}) as Partial<DwSaves> & { resistance?: number };

  if (typeof saves.magic !== "number") saves.magic = Number(saves.magic ?? 0);

  if (saves.resistance != null) {
    const res = Number(saves.resistance ?? 0);

    if (!saves.magic || saves.magic === 0) saves.magic = res;
    delete saves.resistance;
  }

  d.saves = saves as DwSaves;

  const meta = (d.meta ?? {}) as Partial<DwMeta> & Record<string, unknown>;
  const legacyOtherNotes = (d as Record<string, unknown>).otherNotes;

  if (typeof legacyOtherNotes === "string" && !meta.otherNotes) {
    meta.otherNotes = legacyOtherNotes;
  }

  delete (d as Record<string, unknown>).otherNotes;

  const spellsTraitsViewRaw = String(meta.spellsTraitsView ?? "")
    .trim()
    .toLowerCase();

  meta.spellsCollapsed = normalizeBoolean(meta.spellsCollapsed);
  meta.traitsCollapsed = normalizeBoolean(meta.traitsCollapsed);
  meta.meleeAttackBonus = normalizeNumber(meta.meleeAttackBonus);
  meta.missileAttackBonus = normalizeNumber(meta.missileAttackBonus);
  meta.meleeDamageFormula = normalizeString(meta.meleeDamageFormula);
  meta.missileDamageFormula = normalizeString(meta.missileDamageFormula);
  meta.meleeDamageBonus = normalizeNumber(meta.meleeDamageBonus);
  meta.spellsTraitsView = isSpellsTraitsView(spellsTraitsViewRaw) ? spellsTraitsViewRaw : "both";

  d.meta = meta as DwMeta;

  try {
    const schemaNormalized = cleanDwFlagsWithSchema(d);

    if (schemaNormalized) return schemaNormalized;
  } catch (error) {
    reportError("Failed to normalize DW flags with field schema. Falling back to legacy normalization.", error);
  }

  return d as DwFlags;
}
