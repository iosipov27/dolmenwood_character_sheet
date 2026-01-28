/* dolmenwood | Foundry VTT v13 */

import { registerSaveRollListener } from "./listeners/registerSaveRollListener.js";
import { registerSkillRollListener } from "./listeners/registerSkillRollListener.js";
import { registerSaveDblRollListener } from "./listeners/registerSaveDblRollListener.js";
import { registerSkillDblRollListener } from "./listeners/registerSkillDblRollListener.js";
import { registerAbilityRollListener } from "./listeners/registerAbilityRollListener.js";
import { registerAddSkillListener } from "./listeners/registerAddSkillListener.js";
import { registerRemoveSkillListener } from "./listeners/registerRemoveSkillListener.js";
import { registerExtraSkillRollListener } from "./listeners/registerExtraSkillRollListener.js";
import { registerExtraSkillDblRollListener } from "./listeners/registerExtraSkillDblRollListener.js";

const MODULE_ID = "dolmenwood";

function getBaseOSECharacterSheetClass() {
    const entries = Object.values(CONFIG?.Actor?.sheetClasses?.character ?? {});
    const ose = entries.find((s) => {
        const label = String(s?.label ?? "").toLowerCase();
        const clsName = String(s?.cls?.name ?? "").toLowerCase();
        const ns = String(s?.id ?? s?.namespace ?? "").toLowerCase();
        return label.includes("ose") || clsName.includes("ose") || ns.includes("ose");
    });
    return ose?.cls ?? ActorSheet;
}

function dwDefaults() {
    return {
        saves: {
            doom: 0,
            hold: 0,
            spell: 0,
            ray: 0,
            blast: 0,
            magic: 0
        },
        skills: { listen: 0, search: 0, survival: 0 },
        extraSkills: [],
        movement: {
            speed: 0,
            exploring: 0,
            overland: 0
        },
        meta: {
            kindredClass: "",
            background: "",
            alignment: "",
            affiliation: "",
            moonSign: "",
            languages: ""
        }
    };
}


function prettyKey(key) {
    return String(key ?? "").toUpperCase();
}

function formatSigned(n) {
    const x = Number(n ?? 0);
    if (!Number.isFinite(x)) return "0";
    return x >= 0 ? `+${x}` : `${x}`;
}

const SAVE_TOOLTIPS = {
    doom: "DOOM: target to resist fate, dread, and ill fortune.",
    hold: "HOLD: target to resist being held, paralyzed, trapped, or restrained.",
    spell: "SPELL: target to resist hostile spells and enchantments.",
    ray: "RAY: target to resist rays, beams, and aimed magical effects.",
    blast: "BLAST: target to resist blasts, bursts, breath, and area shocks.",
    magic: "MAGIC/RESIST: single value, not rolled here."
};

const SKILL_TOOLTIPS = {
    listen: "LISTEN: target to hear faint sounds and notice subtle noises.",
    search: "SEARCH: target to find hidden details, traps, and clues.",
    survival: "SURVIVAL: target to navigate, track, forage, and endure wilderness travel."
};

const ABILITIES = [
    { key: "str", label: "STR" },
    { key: "dex", label: "DEX" },
    { key: "con", label: "CON" },
    { key: "int", label: "INT" },
    { key: "wis", label: "WIS" },
    { key: "cha", label: "CHA" }
];

function buildAbilities(systemData) {
    const candidates = [
        (k) => `system.abilities.${k}.value`,
        (k) => `system.abilities.${k}`,
        (k) => `system.stats.${k}.value`,
        (k) => `system.stats.${k}`,
        (k) => `system.attributes.${k}.value`,
        (k) => `system.attributes.${k}`,
        (k) => `system.scores.${k}.value`,
        (k) => `system.scores.${k}`,
        (k) => `system.abilities.${k.toUpperCase()}.value`,
        (k) => `system.stats.${k.toUpperCase()}.value`
    ];

    const modCandidates = [
        (base) => base.replace(/\.value$/, ".mod"),
        (base) => base.replace(/\.value$/, ".modifier"),
        (base) => base.replace(/\.value$/, ".bonus"),
        (base) => base.replace(/\.value$/, ".bns")
    ];

    const wrapper = { system: systemData };
    const out = [];

    for (const a of ABILITIES) {
        let foundPath = null;
        let value = "";

        for (const mk of candidates) {
            const p = mk(a.key);
            const v = foundry.utils.getProperty(wrapper, p);
            if (typeof v === "number") {
                foundPath = p;
                value = v;
                break;
            }
        }

        let mod = 0;
        let hasMod = false;
        if (foundPath && String(foundPath).endsWith(".value")) {
            for (const mm of modCandidates) {
                const mp = mm(foundPath);
                const mv = foundry.utils.getProperty(wrapper, mp);
                if (typeof mv === "number") {
                    mod = mv;
                    hasMod = true;
                    break;
                }
            }
        }

        out.push({
            key: a.key,
            label: a.label,
            value,
            name: foundPath ?? "",
            hasPath: Boolean(foundPath),
            mod,
            hasMod,
            modText: hasMod ? formatSigned(mod) : ""
        });
    }

    return out;
}

async function rollTargetCheck(actor, label, target) {
    const t = Number(target ?? 0);
    const roll = await new Roll("1d20").roll({ async: true });
    const success = roll.total >= t;

    const flavor =
        `<span class="dw-roll-title">${label}</span>` +
        ` - target <b>${t}</b> - ` +
        `<span class="dw-${success ? "success" : "fail"}">${success ? "SUCCESS" : "FAIL"}</span>`;

    await roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor }),
        flavor
    });

    return { roll, success, target: t };
}

async function rollAbilityCheck(actor, abilityLabel, abilityValue) {
    const target = Number(abilityValue ?? 0);
    const roll = await new Roll("1d20").roll({ async: true });
    const success = roll.total <= target;

    const flavor =
        `<span class="dw-roll-title">Ability: ${abilityLabel}</span>` +
        ` - roll <b>${roll.total}</b> <= <b>${target}</b> - ` +
        `<span class="dw-${success ? "success" : "fail"}">${success ? "SUCCESS" : "FAIL"}</span>`;

    await roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor }),
        flavor
    });

    return { roll, success, target };
}

function normalizeDwFlags(dw) {
    // If an old "resistance" existed, fold it into magic (prefer magic if set).
    const d = foundry.utils.duplicate(dw ?? {});
    d.saves ??= {};

    if (typeof d.saves.magic !== "number") d.saves.magic = Number(d.saves.magic ?? 0);

    if (d.saves.resistance != null) {
        const res = Number(d.saves.resistance ?? 0);
        if (!d.saves.magic || d.saves.magic === 0) d.saves.magic = res;
        delete d.saves.resistance;
    }

    return d;
}

function buildHp(systemData) {
    const wrapper = { system: systemData };

    // candidates for current HP
    const curCandidates = [
        "system.attributes.hp.value",
        "system.attributes.hp.current",
        "system.hp.value",
        "system.hp.current",
        "system.hp"
    ];

    // candidates for max HP
    const maxCandidates = [
        "system.attributes.hp.max",
        "system.hp.max"
    ];

    let currentPath = null;
    let maxPath = null;

    for (const p of curCandidates) {
        const v = foundry.utils.getProperty(wrapper, p);
        if (typeof v === "number") {
            currentPath = p;
            break;
        }
    }

    for (const p of maxCandidates) {
        const v = foundry.utils.getProperty(wrapper, p);
        if (typeof v === "number") {
            maxPath = p;
            break;
        }
    }

    // read values (may be null if not found)
    const current = currentPath ? foundry.utils.getProperty(wrapper, currentPath) : null;
    const max = maxPath ? foundry.utils.getProperty(wrapper, maxPath) : null;

    return {
        current,
        max,
        nameCurrent: currentPath ?? "",
        nameMax: maxPath ?? "",
        hasCurrent: Boolean(currentPath),
        hasMax: Boolean(maxPath)
    };
}


class DolmenwoodSheet extends getBaseOSECharacterSheetClass() {
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
        data.system = this.actor.system;

        const dwFlagRaw = this.actor.getFlag(MODULE_ID, "dw") ?? {};
        const dwFlag = normalizeDwFlags(dwFlagRaw);

        data.dw = foundry.utils.mergeObject(dwDefaults(), dwFlag, { inplace: false });

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


        data.dwUi = {
            saveTooltips: SAVE_TOOLTIPS,
            skillTooltips: SKILL_TOOLTIPS,
            prettyKey
        };

        data.dwAbilities = buildAbilities(this.actor.system);

        // NEW: HP from OSE system
        data.dwHp = buildHp(this.actor.system)

        // Use a list so we can control labels and rollability.
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

        const getDwFlags = () => normalizeDwFlags(this.actor.getFlag(MODULE_ID, "dw") ?? {});
        const setDwFlags = async (dw) => this.actor.setFlag(MODULE_ID, "dw", dw);
        const renderSheet = () => this.render();

        registerSaveRollListener(html, {
            actor: this.actor,
            getDwFlags,
            rollTargetCheck,
            prettyKey
        });
        registerSkillRollListener(html, {
            actor: this.actor,
            getDwFlags,
            rollTargetCheck,
            prettyKey
        });
        registerSaveDblRollListener(html, { actor: this.actor, rollTargetCheck, prettyKey });
        registerSkillDblRollListener(html, { actor: this.actor, rollTargetCheck, prettyKey });
        registerAbilityRollListener(html, { actor: this.actor, rollAbilityCheck });
        registerAddSkillListener(html, { getDwFlags, setDwFlags, renderSheet });
        registerRemoveSkillListener(html, { getDwFlags, setDwFlags, renderSheet });
        registerExtraSkillRollListener(html, { actor: this.actor, getDwFlags, rollTargetCheck });
        registerExtraSkillDblRollListener(html, { actor: this.actor, rollTargetCheck });

    }

    async _updateObject(event, formData) {
        const expanded = foundry.utils.expandObject(formData);

        if (expanded.dw) {
            const normalized = normalizeDwFlags(expanded.dw);
            await this.actor.setFlag(MODULE_ID, "dw", normalized);
        }

        delete expanded.dw;
        return super._updateObject(event, foundry.utils.flattenObject(expanded));
    }
}

Hooks.once("init", () => {
    Actors.registerSheet(MODULE_ID, DolmenwoodSheet, {
        types: ["character"],
        makeDefault: false,
        label: "Dolmenwood Sheet"
    });
});
