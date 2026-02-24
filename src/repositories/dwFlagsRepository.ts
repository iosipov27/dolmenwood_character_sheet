import { MODULE_ID } from "../constants/moduleId.js";
import { normalizeDwFlags } from "../utils/normalizeDwFlags.js";
import { reportError } from "../utils/reportError.js";
import type { DwFlags } from "../types/index.js";

export function readDwFlags(actor: Actor): DwFlags {
  try {
    const actorWithFlags = actor as Actor & {
      getFlag?(scope: string, key: string): unknown;
    };

    return normalizeDwFlags(
      (actorWithFlags.getFlag?.(MODULE_ID, "dw") as Partial<DwFlags>) ?? {}
    );
  } catch (error) {
    reportError("Failed to read dolmenwood flags from actor.", error);

    return normalizeDwFlags({});
  }
}

export async function writeDwFlags(actor: Actor, dw: DwFlags): Promise<void> {
  try {
    const actorWithFlags = actor as Actor & {
      setFlag?(scope: string, key: string, value: unknown): Promise<unknown>;
    };

    await actorWithFlags.setFlag?.(MODULE_ID, "dw", dw);
  } catch (error) {
    reportError("Failed to write dolmenwood flags to actor.", error);
  }
}
