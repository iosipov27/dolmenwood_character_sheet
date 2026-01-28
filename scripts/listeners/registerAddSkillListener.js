export function registerAddSkillListener(html, { getDwFlags, setDwFlags, renderSheet }) {
    html.find("[data-action='dw-add-skill']").on("click", async (ev) => {
        ev.preventDefault();
        const dw = getDwFlags();
        dw.extraSkills = Array.isArray(dw.extraSkills) ? dw.extraSkills : [];

        if (dw.extraSkills.length >= 10) return;

        dw.extraSkills.push({ name: "", target: 0 });
        await setDwFlags(dw);
        renderSheet();
    });
}
