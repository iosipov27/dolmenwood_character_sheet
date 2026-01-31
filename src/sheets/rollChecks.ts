export class RollChecks {
    static async rollTargetCheck(actor, label, target) {
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

    static async rollAbilityCheck(actor, abilityLabel, abilityValue) {
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
}
