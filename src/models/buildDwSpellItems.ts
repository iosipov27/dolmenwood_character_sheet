import type { DwActorItemEntry } from "../types/index.js";
import { buildDwItemEntriesByType } from "./buildDwItemEntries.js";

export function buildDwSpellItems(actor: Actor): DwActorItemEntry[] {
  return buildDwItemEntriesByType(actor, "spell");
}
