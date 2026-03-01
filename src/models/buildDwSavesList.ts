import type { DwFlags, DwSheetView } from "../types/index.js";
import type { DwLocalize } from "./localize.js";

export function buildDwSavesList(dw: DwFlags, localize: DwLocalize): DwSheetView["lists"]["saves"] {
  return [
    {
      key: "doom",
      label: localize("DOLMENWOOD.Saves.Doom"),
      rollable: true,
      value: dw.saves.doom
    },
    {
      key: "hold",
      label: localize("DOLMENWOOD.Saves.Hold"),
      rollable: true,
      value: dw.saves.hold
    },
    {
      key: "spell",
      label: localize("DOLMENWOOD.Saves.Spell"),
      rollable: true,
      value: dw.saves.spell
    },
    {
      key: "ray",
      label: localize("DOLMENWOOD.Saves.Ray"),
      rollable: true,
      value: dw.saves.ray
    },
    {
      key: "blast",
      label: localize("DOLMENWOOD.Saves.Blast"),
      rollable: true,
      value: dw.saves.blast
    },
    {
      key: "magic",
      label: localize("DOLMENWOOD.Saves.MagicResist"),
      rollable: false,
      value: dw.saves.magic
    }
  ];
}
