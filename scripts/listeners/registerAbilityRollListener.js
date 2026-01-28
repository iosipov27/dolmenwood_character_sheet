export function registerAbilityRollListener(html, { actor, rollAbilityCheck }) {
    html.find("[data-action='dw-roll-ability']").on("click", async (ev) => {
        ev.preventDefault();
        const label = ev.currentTarget.dataset.label ?? "";
        const target = Number(ev.currentTarget.dataset.target ?? 0);
        await rollAbilityCheck(actor, label, target);
    });
}
