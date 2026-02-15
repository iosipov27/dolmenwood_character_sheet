import { getDataset } from "../../utils/getDataset.js";
import type { ActionEvent, HtmlRoot, JQueryWithOn, RollTargetCheck } from "../../types.js";

export function registerSaveDblRollListener(
  html: HtmlRoot,
  {
    actor,
    rollTargetCheck,
    prettyKey
  }: { actor: Actor; rollTargetCheck: RollTargetCheck; prettyKey: (key: string) => string }
): void {
  const localize = (key: string): string => game.i18n?.localize(key) ?? key;
  const nodes = html.find("input[data-dw-dblroll='save']") as JQueryWithOn<HTMLInputElement>;

  nodes.on("dblclick", async (ev: ActionEvent<HTMLInputElement>) => {
    ev.preventDefault();
    const { key } = getDataset(ev);
    const val = Number(ev.currentTarget.value ?? 0);

    await rollTargetCheck(
      actor,
      `${localize("DOLMENWOOD.Roll.SavePrefix")}: ${prettyKey(key ?? "")}`,
      val
    );
  });
}
