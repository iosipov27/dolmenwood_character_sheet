import { ABILITIES } from "../constants/abilities.js";
import { formatSigned } from "./formatSigned.js";

export function buildAbilities(systemData) {
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
