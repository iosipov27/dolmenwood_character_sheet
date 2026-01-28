export function registerExtraSkillDblRollListener(html, { actor, rollTargetCheck }) {
    html.find("input[data-dw-dblroll='extra-skill']").on("dblclick", async (ev) => {
        ev.preventDefault();
        const index = Number(ev.currentTarget.dataset.index);
        const name = String(ev.currentTarget.dataset.name ?? "SKILL").trim() || "SKILL";
        const target = Number(ev.currentTarget.value ?? 0);

        await rollTargetCheck(actor, `Skill: ${name.toUpperCase()}`, target);
    });
}
