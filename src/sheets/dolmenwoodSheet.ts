// Dolmenwood character sheet built on the OSE base sheet.

// Listener registration per interaction type.
import { registerSaveRollListener } from "../listeners/registerSaveRollListener.js";
import { registerSkillRollListener } from "../listeners/registerSkillRollListener.js";
import { registerSaveDblRollListener } from "../listeners/registerSaveDblRollListener.js";
import { registerSkillDblRollListener } from "../listeners/registerSkillDblRollListener.js";
import { registerAbilityRollListener } from "../listeners/registerAbilityRollListener.js";
import { registerAddSkillListener } from "../listeners/registerAddSkillListener.js";
import { registerRemoveSkillListener } from "../listeners/registerRemoveSkillListener.js";
import { registerExtraSkillRollListener } from "../listeners/registerExtraSkillRollListener.js";
import { registerExtraSkillDblRollListener } from "../listeners/registerExtraSkillDblRollListener.js";
import { registerKindredTraitsListener } from "../listeners/registerKindredTraitsListener.js";
import { registerLanguagesListener } from "../listeners/registerLanguagesListener.js";

// Constants/configuration.
import { MODULE_ID } from "../constants/moduleId.js";

// UI-agnostic models/utilities.
import { normalizeDwFlags } from "../utils/normalizeDwFlags.js";
import { prettyKey } from "../utils/prettyKey.js";
import { getBaseOSECharacterSheetClass } from "../utils/getBaseOSECharacterSheetClass.js";
import type { DwFlags, HtmlRoot, DwSheetData } from "../types.js";
import { DolmenwoodSheetData } from "../models/dolmenwoodSheetData.js";

// Roll logic.
import { RollChecks } from "./rollChecks.js";

// Main sheet class extends OSE character sheet.

const BaseSheet = getBaseOSECharacterSheetClass() as typeof ActorSheet;

export class DolmenwoodSheet extends BaseSheet {
  // Sheet configuration.
  static get defaultOptions(): ActorSheet.Options {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["dolmenwood", "sheet", "actor"],
      template: `modules/${MODULE_ID}/templates/dolmenwood.hbs`,
      width: 860,
      height: 900,
      resizable: true
    });
  }

  getData(options?: Partial<ActorSheet.Options>): DwSheetData {
    const data = super.getData(options) as DwSheetData;
    const actor = this.actor as Actor & {
      getFlag(scope: string, key: string): unknown;
      setFlag(scope: string, key: string, value: unknown): Promise<unknown>;
    };

    return DolmenwoodSheetData.populate(data, actor);
  }

  private getDwFlags(): DwFlags {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return normalizeDwFlags(
        ((this.actor as any).getFlag?.(MODULE_ID, "dw") as Partial<DwFlags>) ?? {}
      );
    } catch {
      return normalizeDwFlags({});
    }
  }

  private async setDwFlags(dw: DwFlags): Promise<void> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (this.actor as any).setFlag?.(MODULE_ID, "dw", dw);
    } catch {
      // Silently ignore flag write errors
    }
  }

  activateListeners(html: HtmlRoot): void {
    super.activateListeners(html);

    // Register listeners (minimal — helpers inlined in calls)

    registerSaveRollListener(html, {
      actor: this.actor,
      getDwFlags: () => this.getDwFlags(),
      rollTargetCheck: RollChecks.rollTargetCheck,
      prettyKey
    });

    registerSkillRollListener(html, {
      actor: this.actor,
      getDwFlags: () => this.getDwFlags(),
      rollTargetCheck: RollChecks.rollTargetCheck,
      prettyKey
    });

    registerSaveDblRollListener(html, {
      actor: this.actor,
      rollTargetCheck: RollChecks.rollTargetCheck,
      prettyKey
    });

    registerSkillDblRollListener(html, {
      actor: this.actor,
      rollTargetCheck: RollChecks.rollTargetCheck,
      prettyKey
    });

    registerAbilityRollListener(html, {
      actor: this.actor,
      rollAbilityCheck: RollChecks.rollAbilityCheck
    });

    registerAddSkillListener(html, {
      getDwFlags: () => this.getDwFlags(),
      setDwFlags: (dw: DwFlags) => this.setDwFlags(dw),
      renderSheet: () => this.render()
    });

    registerRemoveSkillListener(html, {
      getDwFlags: () => this.getDwFlags(),
      setDwFlags: (dw: DwFlags) => this.setDwFlags(dw),
      renderSheet: () => this.render()
    });

    registerExtraSkillRollListener(html, {
      actor: this.actor,
      getDwFlags: () => this.getDwFlags(),
      rollTargetCheck: RollChecks.rollTargetCheck
    });

    registerExtraSkillDblRollListener(html, {
      actor: this.actor,
      rollTargetCheck: RollChecks.rollTargetCheck
    });

    registerKindredTraitsListener(html);
    registerLanguagesListener(html);
  }

  async _updateObject(event: Event, formData: Record<string, unknown>): Promise<void> {
    const expanded = foundry.utils.expandObject(formData) as Record<string, unknown> & {
      dw?: unknown;
    };

    if ("dw" in expanded && expanded.dw) {
      const normalized = normalizeDwFlags(expanded.dw as Partial<DwFlags>);
      const actor = this.actor as Actor & {
        setFlag(scope: string, key: string, value: unknown): Promise<unknown>;
      };

      await actor.setFlag(MODULE_ID, "dw", normalized);
    }

    // Prevent dw.* from being written into actor.system.
    delete expanded.dw;

    await super._updateObject(event, foundry.utils.flattenObject(expanded));

    return;
  }
}
