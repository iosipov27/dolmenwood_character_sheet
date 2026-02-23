import { MODULE_ID } from "../constants/moduleId.js";
import { DolmenwoodSheet } from "../sheets/dolmenwoodSheet.js";
import { DolmenwoodSheetV2 } from "../sheets/dolmenwoodSheetV2.js";

export function registerSheet(): void {
  foundry.documents.collections.Actors.registerSheet(MODULE_ID, DolmenwoodSheet, {
    types: ["character"],
    makeDefault: false,
    label: "Dolmenwood Sheet"
  });

  foundry.documents.collections.Actors.registerSheet(
    MODULE_ID,
    DolmenwoodSheetV2 as unknown as foundry.applications.api.ApplicationV2.AnyConstructor,
    {
      types: ["character"],
      makeDefault: false,
      label: "Dolmenwood Sheet V2 (Preview)"
    }
  );
}
