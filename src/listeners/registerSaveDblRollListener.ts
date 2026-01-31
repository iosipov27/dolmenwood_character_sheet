export function registerSaveDblRollListener(html, { actor, rollTargetCheck, prettyKey }) {
    html.find("input[data-dw-dblroll='save']").on("dblclick", async (ev) => {
        ev.preventDefault();
        const key = ev.currentTarget.dataset.key;
        const val = Number(ev.currentTarget.value ?? 0);
        await rollTargetCheck(actor, `Save: ${prettyKey(key)}`, val);
    });
}
