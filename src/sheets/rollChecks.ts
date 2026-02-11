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
    abilityMod: number
  ): Promise<{ roll: Roll; success: boolean; target: number }> {
    const localize = (key: string): string => game.i18n?.localize(key) ?? key;
    const target = 4;
    const mod = Number(abilityMod ?? 0);
    const roll = await new Roll("1d6 + @mod", { mod }).evaluate();
    const total = Number(roll.total ?? 0);
    const dieRoll = RollChecks.getFirstDieResult(roll);
    const autoFail = dieRoll === 1;
    const autoSuccess = dieRoll === 6;
    const success = autoFail ? false : autoSuccess ? true : total >= target;
    const resultLabel = success
      ? localize("DOLMENWOOD.Roll.Success")
      : localize("DOLMENWOOD.Roll.Fail");
    const modText = mod > 0 ? ` + ${mod}` : mod < 0 ? ` - ${Math.abs(mod)}` : "";
    const checkText = autoFail
      ? "d6 <b>1</b> => auto fail"
      : autoSuccess
        ? "d6 <b>6</b> => auto success"
        : `<b>${total}</b> >= <b>${target}</b>`;

    const flavor =
      `<span class="dw-roll-title">${localize("DOLMENWOOD.Roll.AbilityPrefix")}: ${abilityLabel}</span>` +
      ` - 1d6${modText} = <b>${total}</b> - ${checkText} - ` +
      `<span class="dw-${success ? "success" : "fail"}">${resultLabel}</span>`;

    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor
    });

    return { roll: roll as unknown as Roll, success, target };
  }

  static async rollSkillCheck(
    actor: Actor,
    label: string,
    skillValue: number
  ): Promise<{ roll: Roll; success: boolean; target: number }> {
    const localize = (key: string): string => game.i18n?.localize(key) ?? key;
    const targetRaw = Number(skillValue ?? 6);
    const target = Number.isFinite(targetRaw) && targetRaw > 0 ? targetRaw : 6;
    const roll = await new Roll("1d6").evaluate();
    const total = Number(roll.total ?? 0);
    const dieRoll = RollChecks.getFirstDieResult(roll);
    const autoFail = dieRoll === 1;
    const autoSuccess = dieRoll === 6;
    const success = autoFail ? false : autoSuccess ? true : total >= target;
    const resultLabel = success
      ? localize("DOLMENWOOD.Roll.Success")
      : localize("DOLMENWOOD.Roll.Fail");
    const checkText = autoFail
      ? "d6 <b>1</b> => auto fail"
      : autoSuccess
        ? "d6 <b>6</b> => auto success"
        : `<b>${total}</b> >= <b>${target}</b>`;

    const flavor =
      `<span class="dw-roll-title">${label}</span>` +
      ` - 1d6 = <b>${total}</b> - ${checkText} - ` +
      `<span class="dw-${success ? "success" : "fail"}">${resultLabel}</span>`;

    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor
    });

    return { roll: roll as unknown as Roll, success, target };
  }

  private static getFirstDieResult(roll: unknown): number | null {
    const firstResult = (
      roll as {
        dice?: Array<{ results?: Array<{ result?: number; discarded?: boolean }> }>;
      }
    ).dice?.[0]?.results?.find((entry) => !entry.discarded)?.result;

    if (typeof firstResult !== "number" || Number.isNaN(firstResult)) return null;

    return firstResult;
  }

  static async rollAttackCheck(
    actor: Actor,
    attackLabel: string,
    abilityLabel: string,
    abilityMod: number
  ): Promise<{ roll: Roll; mod: number }> {
    const mod = Number(abilityMod ?? 0);
    const roll = await new Roll("1d20 + @mod", { mod }).evaluate();
    const sign = mod >= 0 ? "+" : "-";

    const flavor =
      `<span class="dw-roll-title">${attackLabel}</span>` +
      ` - 1d20 ${sign} <b>${Math.abs(mod)}</b> (${abilityLabel})`;

    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor
    });

    return { roll: roll as unknown as Roll, mod };
  }
}
