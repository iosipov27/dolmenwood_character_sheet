import { getDataset } from "../../utils/getDataset.js";
import type { ActionEvent, HtmlRoot, JQueryWithOn, RollSkillCheck } from "../../types.js";

export function registerExtraSkillDblRollListener(
  html: HtmlRoot,
  { actor, rollSkillCheck }: { actor: Actor; rollSkillCheck: RollSkillCheck }
): void {
  const localize = (key: string): string => game.i18n?.localize(key) ?? key;
  const nodes = html.find("input[data-dw-dblroll='extra-skill']") as JQueryWithOn<HTMLInputElement>;

  nodes.on("dblclick", async (ev: ActionEvent<HTMLInputElement>) => {
    ev.preventDefault();
    const { name } = getDataset(ev);
    const skillName = String(name ?? "SKILL").trim() || "SKILL";
    const targetRaw = Number(ev.currentTarget.value ?? 6);
    const target = Number.isFinite(targetRaw) && targetRaw > 0 ? targetRaw : 6;

    await rollSkillCheck(
      actor,
      `${localize("DOLMENWOOD.Roll.SkillPrefix")}: ${skillName.toUpperCase()}`,
      target
    );
  });
}
