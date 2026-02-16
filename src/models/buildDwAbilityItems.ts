import type { DwActorItemEntry } from "../types.js";
import { buildDwItemEntriesByType } from "./buildDwItemEntries.js";

export function buildDwAbilityItems(actor: Actor): DwActorItemEntry[] {
  return buildDwItemEntriesByType(actor, "ability");
}
