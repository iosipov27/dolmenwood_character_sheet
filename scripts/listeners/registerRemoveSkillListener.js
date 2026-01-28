export function registerRemoveSkillListener(html, { getDwFlags, setDwFlags, renderSheet }) {
    html.find("[data-action='dw-remove-skill']").on("click", async (ev) => {
        ev.preventDefault();
        const index = Number(ev.currentTarget.dataset.index);
        if (!Number.isFinite(index)) return;

        const dw = getDwFlags();
        dw.extraSkills = Array.isArray(dw.extraSkills) ? dw.extraSkills : [];

        if (index < 0 || index >= dw.extraSkills.length) return;

        dw.extraSkills.splice(index, 1);
        await setDwFlags(dw);
        renderSheet();
    });
}
