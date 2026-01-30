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

// Constants/configuration.
import { MODULE_ID } from "../constants/moduleId.js";
import { SAVE_TOOLTIPS } from "../constants/saveTooltips.js";
import { SKILL_TOOLTIPS } from "../constants/skillTooltips.js";

// UI-agnostic models/utilities.
import { dwDefaults } from "../models/dwDefaults.js";
import { normalizeDwFlags } from "../utils/normalizeDwFlags.js";
import { prettyKey } from "../utils/prettyKey.js";
import { buildAbilities } from "../utils/buildAbilities.js";
import {buildCombat} from "../utils/buildCombat.js";
import { buildHp } from "../utils/buildHp.js";
import { getBaseOSECharacterSheetClass } from "../utils/getBaseOSECharacterSheetClass.js";

// Roll logic.
import { RollChecks } from "./rollChecks.js";


// Main sheet class extends OSE character sheet.
export class DolmenwoodSheet extends getBaseOSECharacterSheetClass() {

    // Sheet configuration.
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["dolmenwood", "sheet", "actor"],
            template: `modules/${MODULE_ID}/templates/dolmenwood-sheet.hbs`,
            width: 860,
            height: 900,
            resizable: true
        });
    }

    getData(options) {
        const data = super.getData(options);

        // OSE system data.
        data.system = this.actor.system;

        // Dolmenwood flags (actor.flags.dolmenwood.dw).
        const dwFlagRaw = this.actor.getFlag(MODULE_ID, "dw") ?? {};
        const dwFlag = normalizeDwFlags(dwFlagRaw);

        // Merge defaults with stored flags.
        data.dw = foundry.utils.mergeObject(dwDefaults(), dwFlag, { inplace: false });

        // Skills (fixed + extra).
        const extras = Array.isArray(data.dw.extraSkills) ? data.dw.extraSkills : [];
        data.dwSkillsList = [
            { kind: "fixed", key: "listen", label: "LISTEN", value: data.dw.skills.listen },
            { kind: "fixed", key: "search", label: "SEARCH", value: data.dw.skills.search },
            { kind: "fixed", key: "survival", label: "SURVIVAL", value: data.dw.skills.survival },
            ...extras.map((s, i) => ({
                kind: "extra",
                index: i,
                name: s?.name ?? "",
                target: Number(s?.target ?? 0)
            }))
        ];

        // UI helpers for the template.
        data.dwUi = {
            saveTooltips: SAVE_TOOLTIPS,
            skillTooltips: SKILL_TOOLTIPS,
            prettyKey
        };

        // Abilities from OSE system data.
        data.dwAbilities = buildAbilities(this.actor.system);

        // AC and Attack (read from OSE system data)
        data.dwCombat = buildCombat(this.actor.system);

        // HP from OSE system data.
        data.dwHp = buildHp(this.actor.system);

        // Save targets list (labels, rollable, order).
        data.dwSavesList = [
            { key: "doom", label: "DOOM", rollable: true, value: data.dw.saves.doom },
            { key: "hold", label: "HOLD", rollable: true, value: data.dw.saves.hold },
            { key: "spell", label: "SPELL", rollable: true, value: data.dw.saves.spell },
            { key: "ray", label: "RAY", rollable: true, value: data.dw.saves.ray },
            { key: "blast", label: "BLAST", rollable: true, value: data.dw.saves.blast },
            { key: "magic", label: "MAGIC/RESIST", rollable: false, value: data.dw.saves.magic }
        ];

        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);

        // Small helpers for listeners.
        const getDwFlags = () => normalizeDwFlags(this.actor.getFlag(MODULE_ID, "dw") ?? {});
        const setDwFlags = async (dw) => this.actor.setFlag(MODULE_ID, "dw", dw);
        const renderSheet = () => this.render();

        registerSaveRollListener(html, {
            actor: this.actor,
            getDwFlags,
            rollTargetCheck: RollChecks.rollTargetCheck,
            prettyKey
        });

        registerSkillRollListener(html, {
            actor: this.actor,
            getDwFlags,
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

        registerAddSkillListener(html, { getDwFlags, setDwFlags, renderSheet });
        registerRemoveSkillListener(html, { getDwFlags, setDwFlags, renderSheet });

        registerExtraSkillRollListener(html, {
            actor: this.actor,
            getDwFlags,
            rollTargetCheck: RollChecks.rollTargetCheck
        });

        registerExtraSkillDblRollListener(html, {
            actor: this.actor,
            rollTargetCheck: RollChecks.rollTargetCheck
        });


        // Minimal right-side tabs (vertical)
        const root = html.find("[data-dw-tabs]");
        root.find(".dw-tab").on("click", (ev) => {
            ev.preventDefault();
            const tab = ev.currentTarget.dataset.tab;

            root.find(".dw-tab").removeClass("is-active");
            root.find(`.dw-tab[data-tab="${tab}"]`).addClass("is-active");

            root.find(".dw-tab-panel").removeClass("is-active");
            root.find(`.dw-tab-panel[data-panel="${tab}"]`).addClass("is-active");
        });

    }

    async _updateObject(event, formData) {
        const expanded = foundry.utils.expandObject(formData);

        if (expanded.dw) {
            const normalized = normalizeDwFlags(expanded.dw);
            await this.actor.setFlag(MODULE_ID, "dw", normalized);
        }

        // Prevent dw.* from being written into actor.system.
        delete expanded.dw;

        return super._updateObject(event, foundry.utils.flattenObject(expanded));
    }
}
