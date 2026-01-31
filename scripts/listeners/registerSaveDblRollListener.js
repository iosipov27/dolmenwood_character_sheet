export function registerSaveDblRollListener(html, { actor, rollTargetCheck, prettyKey }) {
    const nodes = html.find("input[data-dw-dblroll='save']");
    nodes.on("dblclick", async (ev) => {
        ev.preventDefault();
        const key = ev.currentTarget.dataset.key;
        const val = Number(ev.currentTarget.value ?? 0);
        await rollTargetCheck(actor, `Save: ${prettyKey(key ?? "")}`, val);
    });
}
