import type { ActorSheetConstructor, SheetClassConfigLike } from "../types.js";

export function getBaseOSECharacterSheetClass(): ActorSheetConstructor {
  const sheetClasses = CONFIG?.Actor?.sheetClasses as unknown as
    | Record<string, Record<string, SheetClassConfigLike>>
    | undefined;
  const entries = Object.values(sheetClasses?.character ?? {});
  const ose = entries.find((s: SheetClassConfigLike) => {
    const label = String(s?.label ?? "").toLowerCase();
    const clsName = String(s?.cls?.name ?? "").toLowerCase();
    const ns = String(s?.id ?? s?.namespace ?? "").toLowerCase();

    return label.includes("ose") || clsName.includes("ose") || ns.includes("ose");
  });

  return ose?.cls ?? ActorSheet;
}
