import { DW_ROLL_EXTRA_SKILL } from "../../constants/templateAttributes.js";
import { getDataset } from "../../utils/getDataset.js";
import type { ActionEvent, HtmlRoot, JQueryWithOn, RollSkillCheck } from "../../types.js";

export function registerExtraSkillRollListener(
  html: HtmlRoot,
  { actor, rollSkillCheck }: { actor: Actor; rollSkillCheck: RollSkillCheck }
): void {
  const localize = (key: string): string => game.i18n?.localize(key) ?? key;
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
    const targetRaw = Number(targetInput?.value ?? 6);
    const target = Number.isFinite(targetRaw) && targetRaw > 0 ? targetRaw : 6;

    await rollSkillCheck(
      actor,
      `${localize("DOLMENWOOD.Roll.SkillPrefix")}: ${skillName.toUpperCase()}`,
      target
    );
  });
}
