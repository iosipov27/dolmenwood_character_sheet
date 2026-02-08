import { DW_ROLL_EXTRA_SKILL } from "../../constants/templateAttributes.js";
import { getDataset } from "../../utils/getDataset.js";
import type { ActionEvent, HtmlRoot, JQueryWithOn, RollTargetCheck } from "../../types.js";

export function registerExtraSkillRollListener(
  html: HtmlRoot,
  { actor, rollTargetCheck }: { actor: Actor; rollTargetCheck: RollTargetCheck }
): void {
  const nodes = html.find(
    `[data-action='${DW_ROLL_EXTRA_SKILL}']`
  ) as JQueryWithOn<HTMLButtonElement>;

  nodes.on("mousedown", async (ev: ActionEvent<HTMLButtonElement>) => {
    ev.preventDefault();

    const { name } = getDataset(ev);
    const row = $(ev.currentTarget).closest(".dw-skill__extra");
    const nameInput = row.find("input.dw-skill__name").get(0) as HTMLInputElement | undefined;
    const targetInput = row.find("input.dw-target").get(0) as HTMLInputElement | undefined;
    const skillName = String(nameInput?.value ?? name ?? "SKILL").trim() || "SKILL";
    const target = Number(targetInput?.value ?? 0) || 0;

    await rollTargetCheck(actor, `Skill: ${skillName.toUpperCase()}`, target);
  });
}
