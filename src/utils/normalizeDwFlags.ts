export function normalizeDwFlags(dw) {
    // If an old "resistance" existed, fold it into magic (prefer magic if set).
    const d = foundry.utils.duplicate(dw ?? {});
    d.saves ??= {};

    if (typeof d.saves.magic !== "number") d.saves.magic = Number(d.saves.magic ?? 0);

    if (d.saves.resistance != null) {
        const res = Number(d.saves.resistance ?? 0);
        if (!d.saves.magic || d.saves.magic === 0) d.saves.magic = res;
        delete d.saves.resistance;
    }

    return d;
}
