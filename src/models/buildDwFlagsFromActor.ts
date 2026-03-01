import { MODULE_ID } from "../constants/moduleId.js";
import type { DwFlags } from "../types.js";
import { normalizeDwFlags } from "../utils/normalizeDwFlags.js";
import { reportError } from "../utils/reportError.js";

export function buildDwFlagsFromActor(actor: Actor): DwFlags {
  const moduleRegistry = game?.modules as Collection<Module> | undefined;
  const moduleActive = moduleRegistry?.get(MODULE_ID)?.active;
  let dwFlagRaw: Partial<Record<string, unknown>> = {};

  try {
    if (moduleActive) {
      const actorWithFlags = actor as Actor & {
        getFlag?(scope: string, key: string): unknown;
      };

      dwFlagRaw =
        (actorWithFlags.getFlag?.(MODULE_ID, "dw") as Partial<Record<string, unknown>>) ?? {};
    }
  } catch (error) {
    reportError("Failed to read dolmenwood flags while building sheet data.", error);
  }

  return normalizeDwFlags(dwFlagRaw);
}
