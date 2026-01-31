import type { DwFlags, DwFlagsInput, DwSaves } from "../types.js";

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
    return d as DwFlags;
}
