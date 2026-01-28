export function registerSaveRollListener(html, { actor, getDwFlags, rollTargetCheck, prettyKey }) {
    html.find("[data-action='dw-roll-save']").on("click", async (ev) => {
        ev.preventDefault();
        const key = ev.currentTarget.dataset.key;
        const dw = getDwFlags();
        const target = Number(foundry.utils.getProperty(dw, `saves.${key}`) ?? 0);
        await rollTargetCheck(actor, `Save: ${prettyKey(key)}`, target);
    });
}
