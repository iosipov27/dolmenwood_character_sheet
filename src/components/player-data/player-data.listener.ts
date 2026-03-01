import { DW_HIDE_OPTIONAL_META_FIELD } from "../../constants/templateAttributes.js";
import type { ActionEvent, ApplyDwPatch, HtmlRoot } from "../../types/index.js";
import { getDataset } from "../../utils/getDataset.js";
import { registerActions } from "../../utils/registerActions.js";

const OPTIONAL_META_FIELD_VISIBILITY_KEYS = {
  affiliation: "player.affiliationVisible",
  moonSign: "player.moonSignVisible"
} as const;

type OptionalMetaField = keyof typeof OPTIONAL_META_FIELD_VISIBILITY_KEYS;

export function registerPlayerDataListener(
  html: HtmlRoot,
  { applyDwPatch }: { applyDwPatch: ApplyDwPatch }
): void {
  registerActions(html, {
    [DW_HIDE_OPTIONAL_META_FIELD]: async (ev: ActionEvent) => {
      const visibilityKey = asVisibilityKey(getDataset(ev).field);

      if (!visibilityKey) return;

      const dwPatch: Record<string, boolean> = {};

      foundry.utils.setProperty(dwPatch, visibilityKey, false);

      await applyDwPatch(dwPatch);
    }
  });
}

function asVisibilityKey(
  value: string | undefined
): (typeof OPTIONAL_META_FIELD_VISIBILITY_KEYS)[OptionalMetaField] | null {
  const normalized = String(value ?? "").trim() as OptionalMetaField;

  return OPTIONAL_META_FIELD_VISIBILITY_KEYS[normalized] ?? null;
}
