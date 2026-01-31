export function registerSkillDblRollListener(html, { actor, rollTargetCheck, prettyKey }) {
    html.find("input[data-dw-dblroll='skill']").on("dblclick", async (ev) => {
        ev.preventDefault();
        const key = ev.currentTarget.dataset.key;
        const val = Number(ev.currentTarget.value ?? 0);
        await rollTargetCheck(actor, `Skill: ${prettyKey(key)}`, val);
    });
}
