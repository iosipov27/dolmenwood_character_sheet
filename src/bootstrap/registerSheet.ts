import { MODULE_ID } from "../constants/moduleId.js";
import { DolmenwoodSheet } from "../sheets/dolmenwoodSheet.js";

export function registerSheet(): void {
  foundry.documents.collections.Actors.registerSheet(MODULE_ID, DolmenwoodSheet, {
    types: ["character"],
    makeDefault: false,
    label: "Dolmenwood Sheet"
  });
}
