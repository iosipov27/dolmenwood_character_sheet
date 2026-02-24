import type { DwActorItemEntry } from "../types/index.js";
import { buildDwItemEntriesByType } from "./buildDwItemEntries.js";

export function buildDwAbilityItems(actor: Actor): DwActorItemEntry[] {
  return buildDwItemEntriesByType(actor, "ability");
}
