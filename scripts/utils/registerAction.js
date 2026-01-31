export function registerAction(html, actionId, handler) {
    const nodes = html.find(`[data-action='${actionId}']`);
    nodes.on("click", async (ev) => {
        ev.preventDefault();
        await handler(ev);
    });
}
