import type { DwFlags, DwFlagsInput, DwMeta, DwSaves } from "../types.js";

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
  d.meta = meta as DwMeta;

  return d as DwFlags;
}
