import { DW_ROLL_EXTRA_SKILL } from "../../constants/templateAttributes.js";
import type { HtmlRoot, RollSkillCheck } from "../../types/index.js";

export function registerExtraSkillRollListener(
  html: HtmlRoot,
  { actor, rollSkillCheck }: { actor: Actor; rollSkillCheck: RollSkillCheck }
): void {
  const localize = (key: string): string => game.i18n?.localize(key) ?? key;
  const selector = `[data-action='${DW_ROLL_EXTRA_SKILL}']`;

  html.on("mousedown", selector, async (event: JQuery.TriggeredEvent) => {
    const eventTarget = event.target as EventTarget | null;
    const targetElement =
      eventTarget instanceof Element
        ? eventTarget
        : eventTarget instanceof Node
          ? eventTarget.parentElement
          : null;
    const button = targetElement?.closest<HTMLButtonElement>(selector);

    if (!(button instanceof HTMLButtonElement)) return;

    event.preventDefault();

    const { name } = button.dataset;
    const row = $(button).closest(".dw-skill__extra");
    const nameInput = row.find("input.dw-skill__name").get(0) as HTMLInputElement | undefined;
    const targetInput = row.find("input.dw-target").get(0) as HTMLInputElement | undefined;
    const skillName = String(nameInput?.value ?? name ?? "SKILL").trim() || "SKILL";
    const targetRaw = Number(targetInput?.value ?? 6);
    const target = Number.isFinite(targetRaw) && targetRaw > 0 ? targetRaw : 6;

    await rollSkillCheck(
      actor,
      `${localize("DOLMENWOOD.Roll.SkillPrefix")}: ${skillName.toUpperCase()}`,
      target
    );
  });
}
