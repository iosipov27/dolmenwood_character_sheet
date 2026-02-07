export class RollChecks {
  static async rollTargetCheck(
    actor: Actor,
    label: string,
    target: number
  ): Promise<{ roll: Roll; success: boolean; target: number }> {
    const localize = (key: string): string => game.i18n?.localize(key) ?? key;
    const t = Number(target ?? 0);
    const roll = await new Roll("1d20").evaluate();
    const success = roll.total >= t;
    const resultLabel = success
      ? localize("DOLMENWOOD.Roll.Success")
      : localize("DOLMENWOOD.Roll.Fail");

    const flavor =
      `<span class="dw-roll-title">${label}</span>` +
      ` - ${localize("DOLMENWOOD.Roll.TargetWord")} <b>${t}</b> - ` +
      `<span class="dw-${success ? "success" : "fail"}">${resultLabel}</span>`;

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
    const localize = (key: string): string => game.i18n?.localize(key) ?? key;
    const target = Number(abilityValue ?? 0);
    const roll = await new Roll("1d20").evaluate();
    const success = roll.total <= target;
    const resultLabel = success
      ? localize("DOLMENWOOD.Roll.Success")
      : localize("DOLMENWOOD.Roll.Fail");

    const flavor =
      `<span class="dw-roll-title">${localize("DOLMENWOOD.Roll.AbilityPrefix")}: ${abilityLabel}</span>` +
      ` - roll <b>${roll.total}</b> <= <b>${target}</b> - ` +
      `<span class="dw-${success ? "success" : "fail"}">${resultLabel}</span>`;

    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor
    });

    return { roll, success, target };
  }
}
