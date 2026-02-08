import { getDataset } from "../../utils/getDataset.js";
import type { ActionEvent, HtmlRoot, JQueryWithOn, RollTargetCheck } from "../../types.js";

export function registerSkillDblRollListener(
  html: HtmlRoot,
  {
    actor,
    rollTargetCheck,
    prettyKey
  }: { actor: Actor; rollTargetCheck: RollTargetCheck; prettyKey: (key: string) => string }
): void {
  const nodes = html.find("input[data-dw-dblroll='skill']") as JQueryWithOn<HTMLInputElement>;

  nodes.on("dblclick", async (ev: ActionEvent<HTMLInputElement>) => {
    ev.preventDefault();
    const { key } = getDataset(ev);
    const val = Number(ev.currentTarget.value ?? 0);

    await rollTargetCheck(actor, `Skill: ${prettyKey(key ?? "")}`, val);
  });
}

