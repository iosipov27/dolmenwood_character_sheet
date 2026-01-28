export function registerExtraSkillRollListener(html, { actor, getDwFlags, rollTargetCheck }) {
    html.find("[data-action='dw-roll-extra-skill']").on("click", async (ev) => {
        ev.preventDefault();
        const index = Number(ev.currentTarget.dataset.index);
        const name = String(ev.currentTarget.dataset.name ?? "SKILL").trim() || "SKILL";

        const dw = getDwFlags();
        const arr = Array.isArray(dw.extraSkills) ? dw.extraSkills : [];
        const target = Number(arr[index]?.target ?? 0);

        await rollTargetCheck(actor, `Skill: ${name.toUpperCase()}`, target);
    });
}
