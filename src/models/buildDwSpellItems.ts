import type { DwActorItemEntry } from "../types.js";
import { extractSpellRollFormula } from "../utils/spellRollFormula.js";

export function buildDwSpellItems(actor: Actor): DwActorItemEntry[] {
  return actor.items
    .filter((item) => String(item.type ?? "").toLowerCase() === "spell")
    .sort((left, right) => String(left.name ?? "").localeCompare(String(right.name ?? "")))
    .map(
      (item): DwActorItemEntry => ({
        id: String(item.id ?? ""),
        name: String(item.name ?? ""),
        img: String(item.img ?? "icons/svg/book.svg"),
        rollFormula: extractSpellRollFormula(item) ?? undefined
      })
    )
    .filter((item) => Boolean(item.id));
}
