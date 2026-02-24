import type { DwFlags } from "../types/index.js";
import { dwDefaults } from "./dwDefaults.js";
import { buildDwFlagsFromActor } from "./buildDwFlagsFromActor.js";

export function buildDwData(actor: Actor): DwFlags {
  const dwFlag = buildDwFlagsFromActor(actor);

  return foundry.utils.mergeObject(dwDefaults(), dwFlag, { inplace: false }) as DwFlags;
}
