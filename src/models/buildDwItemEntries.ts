import type { DwActorItemEntry } from "../types/index.js";

export function buildDwItemEntriesByType(actor: Actor, itemType: string): DwActorItemEntry[] {
  const normalizedType = String(itemType ?? "").trim().toLowerCase();

  return actor.items
    .filter((item) => String(item.type ?? "").toLowerCase() === normalizedType)
    .sort((left, right) => String(left.name ?? "").localeCompare(String(right.name ?? "")))
    .map(
      (item): DwActorItemEntry => ({
        id: String(item.id ?? ""),
        name: String(item.name ?? ""),
        img: String(item.img ?? "icons/svg/book.svg")
      })
    )
    .filter((item) => Boolean(item.id));
}
