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
import { DolmenwoodSheetData } from "../models/dolmenwoodSheetData.js";
// Roll logic.
import { RollChecks } from "./rollChecks.js";
// Main sheet class extends OSE character sheet.
const BaseSheet = getBaseOSECharacterSheetClass();
export class DolmenwoodSheet extends BaseSheet {
    // Sheet configuration.
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["dolmenwood", "sheet", "actor"],
            template: `modules/${MODULE_ID}/templates/dolmenwood.hbs`,
            width: 860,
            height: 900,
            resizable: true
        });
    }
    getData(options) {
        const data = super.getData(options);
        const actor = this.actor;
        return DolmenwoodSheetData.populate(data, actor);
    }
    getDwFlags() {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return normalizeDwFlags(this.actor.getFlag?.(MODULE_ID, "dw") ?? {});
        }
        catch {
            return normalizeDwFlags({});
        }
    }
    async setDwFlags(dw) {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await this.actor.setFlag?.(MODULE_ID, "dw", dw);
        }
        catch {
            // Silently ignore flag write errors
        }
    }
    activateListeners(html) {
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
            setDwFlags: (dw) => this.setDwFlags(dw),
            renderSheet: () => this.render()
        });
        registerRemoveSkillListener(html, {
            getDwFlags: () => this.getDwFlags(),
            setDwFlags: (dw) => this.setDwFlags(dw),
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
    async _updateObject(event, formData) {
        const expanded = foundry.utils.expandObject(formData);
        if ("dw" in expanded && expanded.dw) {
            const normalized = normalizeDwFlags(expanded.dw);
            const actor = this.actor;
            await actor.setFlag(MODULE_ID, "dw", normalized);
        }
        // Prevent dw.* from being written into actor.system.
        delete expanded.dw;
        await super._updateObject(event, foundry.utils.flattenObject(expanded));
        return;
    }
}
//# sourceMappingURL=dolmenwoodSheet.js.map