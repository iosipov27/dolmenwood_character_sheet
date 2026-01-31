export function normalizeDwFlags(dw) {
    // If an old "resistance" existed, fold it into magic (prefer magic if set).
    const d = foundry.utils.duplicate(dw ?? {});
    const saves = (d.saves ?? {});
    if (typeof saves.magic !== "number")
        saves.magic = Number(saves.magic ?? 0);
    if (saves.resistance != null) {
        const res = Number(saves.resistance ?? 0);
        if (!saves.magic || saves.magic === 0)
            saves.magic = res;
        delete saves.resistance;
    }
    d.saves = saves;
    return d;
}
