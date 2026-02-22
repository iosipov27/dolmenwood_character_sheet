import type { RollModifierPart } from "../types.js";
import { DW_ROLL_ATTACK_DAMAGE } from "../constants/templateAttributes.js";

export class RollChecks {
  static async rollTargetCheck(
    actor: Actor,
    label: string,
    target: number
  ): Promise<{ roll: Roll; success: boolean; target: number } | null> {
    const localize = (key: string): string => game.i18n?.localize(key) ?? key;
    const t = Number(target ?? 0);
    const roll = await RollChecks.createRollWithPrompt({
      title: label,
      displayFormula: "1d20",
      rollFormula: "1d20"
    });

    if (!roll) return null;

    const total = Number(roll.total ?? 0);
    const success = total >= t;
    const status = success
      ? localize("DOLMENWOOD.Roll.Success")
      : localize("DOLMENWOOD.Roll.Fail");
    const flavor = RollChecks.buildRollFlavor({
      title: label,
      status,
      statusKind: success ? "success" : "fail"
    });

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
  ): Promise<{ roll: Roll; success: boolean; target: number } | null> {
    const localize = (key: string): string => game.i18n?.localize(key) ?? key;
    const target = 4;
    const modRaw = Number(abilityMod ?? 0);
    const mod = Number.isFinite(modRaw) ? modRaw : 0;
    const title = `${localize("DOLMENWOOD.Roll.AbilityPrefix")}: ${abilityLabel}`;
    const displayFormula = RollChecks.formatFormulaWithNumericModifier("1d6", mod);
    const roll = await RollChecks.createRollWithPrompt({
      title,
      displayFormula,
      rollFormula: "1d6 + @mod",
      rollData: { mod }
    });

    if (!roll) return null;

    const total = Number(roll.total ?? 0);
    const dieRoll = RollChecks.getFirstDieResult(roll);
    const autoFail = dieRoll === 1;
    const autoSuccess = dieRoll === 6;
    const success = autoFail ? false : autoSuccess ? true : total >= target;
    const status = success
      ? localize("DOLMENWOOD.Roll.Success")
      : localize("DOLMENWOOD.Roll.Fail");
    const flavor = RollChecks.buildRollFlavor({
      title,
      status,
      statusKind: success ? "success" : "fail"
    });

    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor
    });

    return { roll, success, target };
  }

  static async rollSkillCheck(
    actor: Actor,
    label: string,
    skillValue: number
  ): Promise<{ roll: Roll; success: boolean; target: number } | null> {
    const localize = (key: string): string => game.i18n?.localize(key) ?? key;
    const targetRaw = Number(skillValue ?? 6);
    const target = Number.isFinite(targetRaw) && targetRaw > 0 ? targetRaw : 6;
    const roll = await RollChecks.createRollWithPrompt({
      title: label,
      displayFormula: "1d6",
      rollFormula: "1d6"
    });

    if (!roll) return null;

    const total = Number(roll.total ?? 0);
    const dieRoll = RollChecks.getFirstDieResult(roll);
    const autoFail = dieRoll === 1;
    const autoSuccess = dieRoll === 6;
    const success = autoFail ? false : autoSuccess ? true : total >= target;
    const status = success
      ? localize("DOLMENWOOD.Roll.Success")
      : localize("DOLMENWOOD.Roll.Fail");
    const flavor = RollChecks.buildRollFlavor({
      title: label,
      status,
      statusKind: success ? "success" : "fail"
    });

    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor
    });

    return { roll, success, target };
  }

  static async rollAttackCheck(
    actor: Actor,
    attackLabel: string,
    _abilityLabel: string,
    abilityMod: number,
    modifierParts: RollModifierPart[] = [],
    damageFormula?: string
  ): Promise<{ roll: Roll; mod: number } | null> {
    const localize = (key: string): string => game.i18n?.localize(key) ?? key;
    const normalizedParts = modifierParts
      .map((part) => ({
        value: Number(part.value),
        label: String(part.label ?? "").trim()
      }))
      .filter((part) => Number.isFinite(part.value) && part.value !== 0);
    const fallbackModRaw = Number(abilityMod ?? 0);
    const fallbackMod = Number.isFinite(fallbackModRaw) ? fallbackModRaw : 0;
    const mod = normalizedParts.length
      ? normalizedParts.reduce((sum, part) => sum + part.value, 0)
      : fallbackMod;
    const displayFormula = normalizedParts.length
      ? RollChecks.formatFormulaWithModifierParts("1d20", normalizedParts)
      : RollChecks.formatFormulaWithNumericModifier("1d20", mod);
    const roll = await RollChecks.createRollWithPrompt({
      title: attackLabel,
      displayFormula,
      rollFormula: "1d20 + @mod",
      rollData: { mod }
    });

    if (!roll) return null;

    const dieRoll = RollChecks.getFirstDieResult(roll);
    const autoFail = dieRoll === 1;
    const autoSuccess = dieRoll === 20;
    const status = autoFail
      ? localize("DOLMENWOOD.Roll.Fail")
      : autoSuccess
        ? localize("DOLMENWOOD.Roll.Success")
        : null;
    const statusKind = autoFail ? "fail" : autoSuccess ? "success" : null;
    const parsedDamageFormula = String(damageFormula ?? "").trim();
    const actions = parsedDamageFormula
      ? RollChecks.buildDamageRollActionMarkup({
          formula: parsedDamageFormula,
          label: localize("DOLMENWOOD.UI.RollDamage")
        })
      : "";
    const flavor = RollChecks.buildRollFlavor({
      title: attackLabel,
      status,
      statusKind,
      actions
    });

    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor
    });

    return { roll, mod };
  }

  private static async createRollWithPrompt({
    title,
    displayFormula,
    rollFormula,
    rollData
  }: {
    title: string;
    displayFormula: string;
    rollFormula: string;
    rollData?: Record<string, unknown>;
  }): Promise<Roll | null> {
    const localize = (key: string): string => game.i18n?.localize(key) ?? key;
    const modifier = await RollChecks.promptRollModifier({ title, formula: displayFormula });

    if (modifier === null) return null;

    const formula = RollChecks.appendModifier(rollFormula, modifier);

    try {
      const evaluated = rollData
        ? await new Roll(formula, rollData).evaluate()
        : await new Roll(formula).evaluate();

      return evaluated as unknown as Roll;
    } catch {
      ui.notifications?.error(localize("DOLMENWOOD.Roll.InvalidModifier"));

      return null;
    }
  }

  private static async promptRollModifier({
    title,
    formula
  }: {
    title: string;
    formula: string;
  }): Promise<string | null> {
    const fvtt = globalThis.foundry as typeof foundry | undefined;

    if (!fvtt?.applications?.api?.DialogV2) return "";

    const localize = (key: string): string => game.i18n?.localize(key) ?? key;
    const content =
      `<div class="form-group">` +
      `<label>${RollChecks.escapeHtml(localize("DOLMENWOOD.Roll.Formula"))}</label>` +
      `<div>${RollChecks.escapeHtml(formula)}</div>` +
      `</div>` +
      `<div class="form-group">` +
      `<label>${RollChecks.escapeHtml(localize("DOLMENWOOD.Roll.Modifier"))}</label>` +
      `<input type="text" name="modifier" placeholder="${RollChecks.escapeHtml(localize("DOLMENWOOD.Roll.ModifierPlaceholder"))}" autofocus>` +
      `</div>`;
    const config: foundry.applications.api.DialogV2.PromptConfig = {
      window: { title },
      content,
      modal: true,
      rejectClose: false,
      ok: {
        label: localize("DOLMENWOOD.UI.Roll"),
        icon: "fa-solid fa-dice-d20",
        callback: (_event: PointerEvent | SubmitEvent, button: HTMLButtonElement) => {
          const input = button.form?.elements.namedItem("modifier");

          return input instanceof HTMLInputElement ? input.value.trim() : "";
        }
      }
    };
    const result = await fvtt.applications.api.DialogV2.prompt(config);

    if (result === null) return null;

    return String(result ?? "").trim();
  }

  private static appendModifier(formula: string, modifier: string): string {
    const trimmed = modifier.trim();

    if (!trimmed) return formula;

    if (trimmed.startsWith("+") || trimmed.startsWith("-")) {
      return `${formula} ${trimmed}`;
    }

    return `${formula} + ${trimmed}`;
  }

  private static formatFormulaWithNumericModifier(baseFormula: string, modifier: number): string {
    if (!modifier) return baseFormula;

    const sign = modifier > 0 ? "+" : "-";

    return `${baseFormula} ${sign} ${Math.abs(modifier)}`;
  }

  private static formatFormulaWithModifierParts(
    baseFormula: string,
    modifiers: RollModifierPart[]
  ): string {
    if (!modifiers.length) return baseFormula;

    return modifiers.reduce((formula, part) => {
      const sign = part.value > 0 ? "+" : "-";
      const label = part.label ? ` (${part.label})` : "";

      return `${formula} ${sign} ${Math.abs(part.value)}${label}`;
    }, baseFormula);
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

  private static buildRollFlavor({
    title,
    status,
    statusKind,
    actions = ""
  }: {
    title: string;
    status: string | null;
    statusKind: "success" | "fail" | null;
    actions?: string;
  }): string {
    const statusMarkup =
      status && statusKind
        ? `<div class="dw-roll-card__status dw-roll-card__status--${statusKind}">${RollChecks.escapeHtml(status)}</div>`
        : "";

    return (
      `<div class="dw-roll-card">` +
      `<div class="dw-roll-card__title">${RollChecks.escapeHtml(title)}</div>` +
      statusMarkup +
      actions +
      `</div>`
    );
  }

  private static buildDamageRollActionMarkup({
    formula,
    label
  }: {
    formula: string;
    label: string;
  }): string {
    const escapedFormula = RollChecks.escapeHtml(formula);
    const escapedLabel = RollChecks.escapeHtml(label);

    return (
      `<div class="dw-roll-card__actions">` +
      `<button class="dw-roll-card__action-button" type="button" data-action="${DW_ROLL_ATTACK_DAMAGE}" data-damage-formula="${escapedFormula}">` +
      escapedLabel +
      `</button>` +
      `</div>`
    );
  }

  private static escapeHtml(value: unknown): string {
    const raw = String(value ?? "");
    const fvtt = globalThis.foundry as typeof foundry | undefined;
    const escape = fvtt?.utils?.escapeHTML;

    if (typeof escape === "function") return escape(raw);

    return raw
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }
}
