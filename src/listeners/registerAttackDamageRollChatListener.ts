import { DW_ROLL_ATTACK_DAMAGE } from "../constants/templateAttributes.js";

function localize(key: string): string {
  return game.i18n?.localize(key) ?? key;
}

async function rollDamage(
  button: HTMLButtonElement,
  formula: string,
  speaker: ChatMessage.SpeakerData | null
): Promise<void> {
  button.disabled = true;

  try {
    const roll = await new Roll(formula).evaluate();

    await roll.toMessage({
      speaker: speaker ?? ChatMessage.getSpeaker(),
      flavor: localize("DOLMENWOOD.UI.RollDamage")
    });
  } catch {
    ui.notifications?.error(localize("DOLMENWOOD.Roll.InvalidModifier"));
  } finally {
    button.disabled = false;
  }
}

export function registerAttackDamageRollChatListener(): void {
  Hooks.off("renderChatMessageHTML", onRenderChatMessageHTML);
  Hooks.on("renderChatMessageHTML", onRenderChatMessageHTML);
}

function onRenderChatMessageHTML(message: ChatMessage.Implementation, html: HTMLElement): void {
  if (html.dataset.dwDamageRollBound === "true") return;

  html.dataset.dwDamageRollBound = "true";

  html.addEventListener("click", (event) => {
    const target = event.target;

    if (!(target instanceof Element)) return;

    const button = target.closest<HTMLButtonElement>(`[data-action='${DW_ROLL_ATTACK_DAMAGE}']`);

    if (!(button instanceof HTMLButtonElement)) return;

    event.preventDefault();
    event.stopPropagation();

    if (button.disabled) return;

    const formula = String(button.dataset.damageFormula ?? "").trim();

    if (!formula) return;

    void rollDamage(button, formula, message.speaker);
  });
}
