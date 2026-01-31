export function registerAction(html, actionId, handler) {
    html.find(`[data-action='${actionId}']`).on("click", async (ev) => {
        ev.preventDefault();
        await handler(ev);
    });
}
