export function registerSkillRollListener(html, { actor, getDwFlags, rollTargetCheck, prettyKey }) {
    html.find("[data-action='dw-roll-skill']").on("click", async (ev) => {
        ev.preventDefault();
        const key = ev.currentTarget.dataset.key;
        const dw = getDwFlags();
        const target = Number(foundry.utils.getProperty(dw, `skills.${key}`) ?? 0);
        await rollTargetCheck(actor, `Skill: ${prettyKey(key)}`, target);
    });
}
