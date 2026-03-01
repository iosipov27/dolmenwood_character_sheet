import type { DwFlags } from "./dw.js";
import type { BaseSheetData } from "./foundry.js";
import type { DwSheetView } from "./sheetView.js";

export type DwSheetData = BaseSheetData & {
  system: Record<string, unknown>;
  dw: DwFlags;
  view: DwSheetView;
};
