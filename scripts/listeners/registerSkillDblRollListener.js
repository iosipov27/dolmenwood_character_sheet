import { getDataset } from "../utils/getDataset.js";
export function registerSkillDblRollListener(html, { actor, rollTargetCheck, prettyKey }) {
  const nodes = html.find("input[data-dw-dblroll='skill']");
  nodes.on("dblclick", async (ev) => {
    ev.preventDefault();
    const { key } = getDataset(ev);
    const val = Number(ev.currentTarget.value ?? 0);
    await rollTargetCheck(actor, `Skill: ${prettyKey(key ?? "")}`, val);
  });
}
//# sourceMappingURL=registerSkillDblRollListener.js.map
