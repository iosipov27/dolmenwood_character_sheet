import { getDataset } from "../../utils/getDataset.js";
import type { ActionEvent, HtmlRoot, JQueryWithOn, RollSkillCheck } from "../../types.js";

export function registerSkillDblRollListener(
  html: HtmlRoot,
  {
    actor,
    rollSkillCheck,
    prettyKey
  }: { actor: Actor; rollSkillCheck: RollSkillCheck; prettyKey: (key: string) => string }
): void {
  const localize = (key: string): string => game.i18n?.localize(key) ?? key;
  const nodes = html.find("input[data-dw-dblroll='skill']") as JQueryWithOn<HTMLInputElement>;

  nodes.on("dblclick", async (ev: ActionEvent<HTMLInputElement>) => {
    ev.preventDefault();
    const { key } = getDataset(ev);
    const targetRaw = Number(ev.currentTarget.value ?? 6);
    const target = Number.isFinite(targetRaw) && targetRaw > 0 ? targetRaw : 6;

    await rollSkillCheck(actor, `${localize("DOLMENWOOD.Roll.SkillPrefix")}: ${prettyKey(key ?? "")}`, target);
  });
}
