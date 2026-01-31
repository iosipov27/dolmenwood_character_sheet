import { getDataset } from "../utils/getDataset.js";
import type { ActionEvent, HtmlRoot, JQueryWithOn, RollTargetCheck } from "../types.js";

export function registerExtraSkillDblRollListener(
    html: HtmlRoot,
    { actor, rollTargetCheck }: { actor: Actor; rollTargetCheck: RollTargetCheck }
): void {
    const nodes = html.find("input[data-dw-dblroll='extra-skill']") as JQueryWithOn<HTMLInputElement>;
    nodes.on("dblclick", async (ev: ActionEvent<HTMLInputElement>) => {
        ev.preventDefault();
        const { index, name } = getDataset(ev);
        const skillIndex = Number(index);
        const skillName = String(name ?? "SKILL").trim() || "SKILL";
        const target = Number(ev.currentTarget.value ?? 0);

        await rollTargetCheck(actor, `Skill: ${skillName.toUpperCase()}`, target);
    });
}
