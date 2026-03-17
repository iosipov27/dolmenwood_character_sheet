import {
  registerAbilityRollListener,
  registerAddSkillListener,
  registerAttackRollListener,
  registerEquipmentListener,
  registerExtraSkillRollListener,
  registerPlayerDataListener,
  registerRemoveSkillListener,
  registerSaveRollListener,
  registerSkillRollListener,
  registerSpellsListener,
  registerSpellsTraitsViewListener
} from "../components/index.js";
import { prettyKey } from "../utils/prettyKey.js";
import { RollChecks } from "../sheets/rollChecks.js";
import type { ApplyDwPatch, GetDwFlags, HtmlRoot } from "../types/index.js";

export function registerSheetListeners(
  html: HtmlRoot,
  {
    actor,
    getDwFlags,
    applyDwPatch
  }: {
    actor: Actor;
    getDwFlags: GetDwFlags;
    applyDwPatch: ApplyDwPatch;
  }
): void {
  registerSaveRollListener(html, {
    actor,
    getDwFlags,
    rollTargetCheck: RollChecks.rollTargetCheck,
    prettyKey
  });

  registerSkillRollListener(html, {
    actor,
    getDwFlags,
    rollSkillCheck: RollChecks.rollSkillCheck,
    prettyKey
  });

  registerAbilityRollListener(html, {
    actor,
    rollAbilityCheck: RollChecks.rollAbilityCheck
  });

  registerAttackRollListener(html, {
    actor,
    rollAttackCheck: RollChecks.rollAttackCheck
  });

  registerPlayerDataListener(html, {
    applyDwPatch: (dwPatch) => applyDwPatch(dwPatch)
  });

  registerAddSkillListener(html, {
    getDwFlags,
    applyDwPatch: (dwPatch) => applyDwPatch(dwPatch)
  });

  registerRemoveSkillListener(html, {
    getDwFlags,
    applyDwPatch: (dwPatch) => applyDwPatch(dwPatch)
  });

  registerExtraSkillRollListener(html, {
    actor,
    rollSkillCheck: RollChecks.rollSkillCheck
  });

  registerSpellsListener(html, {
    actor,
    getDwFlags,
    applyDwPatch: (dwPatch) => applyDwPatch(dwPatch)
  });
  registerSpellsTraitsViewListener(html, {
    getDwFlags,
    applyDwPatch: (dwPatch) => applyDwPatch(dwPatch)
  });

  registerEquipmentListener(html, {
    applyDwPatch: (dwPatch) => applyDwPatch(dwPatch),
    fromDropData: async (data) => (await Item.fromDropData(data)) ?? null,
    fromUuid: async (uuid) => {
      const resolver = globalThis.fromUuid as ((value: string) => Promise<unknown>) | undefined;

      if (typeof resolver !== "function") return null;

      const document = await resolver(uuid);

      return isItemDocumentLike(document) ? (document as Item) : null;
    },
    localize: (key) => game.i18n?.localize(key) ?? key,
    warn: (message) => {
      ui.notifications?.warn(message);
    }
  });
}

function isItemDocumentLike(value: unknown): value is Item {
  return Boolean(value && typeof value === "object" && "sheet" in value);
}
