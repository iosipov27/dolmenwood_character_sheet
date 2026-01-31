export class RollChecks {
  static async rollTargetCheck(
    actor: Actor,
    label: string,
    target: number
  ): Promise<{ roll: Roll; success: boolean; target: number }> {
    const t = Number(target ?? 0);
    const roll = await new Roll("1d20").evaluate();
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

  static async rollAbilityCheck(
    actor: Actor,
    abilityLabel: string,
    abilityValue: number
  ): Promise<{ roll: Roll; success: boolean; target: number }> {
    const target = Number(abilityValue ?? 0);
    const roll = await new Roll("1d20").evaluate();
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
