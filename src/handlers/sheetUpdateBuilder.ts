import { OseCharacterSheetAdapter } from "../adapters/oseCharacterSheetAdapter.js";
import { MODULE_ID } from "../constants/moduleId.js";
import { cleanDwFlagsWithSchema } from "../models/dwSchema.js";
import type { DwFlagsInput } from "../types/index.js";

function readCurrentDw(actor: Actor): Record<string, unknown> {
  const actorWithFlags = actor as Actor & {
    getFlag?(scope: string, key: string): unknown;
  };
  const currentDw = actorWithFlags.getFlag?.(MODULE_ID, "dw");

  if (!currentDw || typeof currentDw !== "object") {
    return {};
  }

  return foundry.utils.duplicate(currentDw as Record<string, unknown>) as Record<string, unknown>;
}

export function buildDwUpdatePayload(actor: Actor, dwPatch: object): Record<string, unknown> {
  const nextDw = readCurrentDw(actor);
  const flattenedPatch = foundry.utils.flattenObject(
    foundry.utils.duplicate(dwPatch) as Record<string, unknown>
  ) as Record<string, unknown>;

  for (const [path, value] of Object.entries(flattenedPatch)) {
    foundry.utils.setProperty(nextDw, path, value);
  }

  const cleanedDw = cleanDwFlagsWithSchema(nextDw as DwFlagsInput);

  if (!cleanedDw) return {};

  return {
    [`flags.${MODULE_ID}.dw`]: cleanedDw
  };
}

export function buildFieldUpdatePayload(
  actor: Actor,
  name: string,
  value: unknown
): Record<string, unknown> {
  if (name.startsWith("dw.")) {
    const dwPatch: Record<string, unknown> = {};

    foundry.utils.setProperty(dwPatch, name.slice(3), value);

    return buildDwUpdatePayload(actor, dwPatch);
  }

  if (name === `flags.${MODULE_ID}.dw` || name.startsWith(`flags.${MODULE_ID}.dw.`)) {
    return {};
  }

  if (name === "system.ac.value" || name === "system.aac.value") {
    return OseCharacterSheetAdapter.remapDerivedArmorClassEdits({ [name]: value }, actor);
  }

  return { [name]: value };
}
