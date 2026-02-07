import { MODULE_ID } from "../constants/moduleId.js";
import { DolmenwoodSheetData } from "../models/dolmenwoodSheetData.js";
import type { DwFlags, HtmlRoot, DwSheetData } from "../types.js";
import { registerSheetListeners } from "../listeners/registerSheetListeners.js";
import { normalizeDwFlags } from "../utils/normalizeDwFlags.js";
import { getBaseOSECharacterSheetClass } from "../utils/getBaseOSECharacterSheetClass.js";
import { reportError } from "../utils/reportError.js";

const BaseSheet = getBaseOSECharacterSheetClass() as typeof foundry.appv1.sheets.ActorSheet;

export class DolmenwoodSheet extends BaseSheet {
  static get defaultOptions(): ActorSheet.Options {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["dolmenwood", "sheet", "actor"],
      template: `modules/${MODULE_ID}/templates/dolmenwood.hbs`,
      width: 640,
      height: 730,
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
      const actorWithFlags = this.actor as Actor & {
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

  private async setDwFlags(dw: DwFlags): Promise<void> {
    try {
      const actorWithFlags = this.actor as Actor & {
        setFlag?(scope: string, key: string, value: unknown): Promise<unknown>;
      };

      await actorWithFlags.setFlag?.(MODULE_ID, "dw", dw);
    } catch (error) {
      reportError("Failed to write dolmenwood flags to actor.", error);
    }
  }

  activateListeners(html: HtmlRoot): void {
    super.activateListeners(html);
    this.activateTabNavigation(html);

    registerSheetListeners(html, {
      actor: this.actor,
      getDwFlags: () => this.getDwFlags(),
      setDwFlags: (dw: DwFlags) => this.setDwFlags(dw),
      renderSheet: () => this.render(),
      sheet: this
    });
  }

  private activateTabNavigation(html: HtmlRoot): void {
    const tabs = html.find("[data-tab-target]");
    const panels = html.find("[data-tab-panel]");

    tabs.on("click", (ev: Event) => {
      ev.preventDefault();
      ev.stopPropagation();

      const target = (ev.currentTarget as HTMLElement | null)?.dataset?.tabTarget;
      if (!target) return;

      tabs.removeClass("is-active");
      $(ev.currentTarget as HTMLElement).addClass("is-active");

      panels.removeClass("is-active");
      html.find(`[data-tab-panel='${target}']`).addClass("is-active");

      return false;
    });
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

    delete expanded.dw;

    await super._updateObject(event, foundry.utils.flattenObject(expanded));
  }
}
