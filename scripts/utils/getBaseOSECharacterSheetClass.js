export function getBaseOSECharacterSheetClass() {
    const entries = Object.values(CONFIG?.Actor?.sheetClasses?.character ?? {});
    const ose = entries.find((s) => {
        const label = String(s?.label ?? "").toLowerCase();
        const clsName = String(s?.cls?.name ?? "").toLowerCase();
        const ns = String(s?.id ?? s?.namespace ?? "").toLowerCase();
        return label.includes("ose") || clsName.includes("ose") || ns.includes("ose");
    });
    return ose?.cls ?? ActorSheet;
}
