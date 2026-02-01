import { getDataset } from "../utils/getDataset.js";
export function registerExtraSkillDblRollListener(html, { actor, rollTargetCheck }) {
    const nodes = html.find("input[data-dw-dblroll='extra-skill']");
    nodes.on("dblclick", async (ev) => {
        ev.preventDefault();
        const { name } = getDataset(ev);
        const skillName = String(name ?? "SKILL").trim() || "SKILL";
        const target = Number(ev.currentTarget.value ?? 0);
        await rollTargetCheck(actor, `Skill: ${skillName.toUpperCase()}`, target);
    });
}
//# sourceMappingURL=registerExtraSkillDblRollListener.js.map