import type { ActionEvent, HtmlRoot, JQueryWithOn, RollTargetCheck } from "../types.js";

export function registerSaveDblRollListener(
    html: HtmlRoot,
    {
        actor,
        rollTargetCheck,
        prettyKey
    }: { actor: Actor; rollTargetCheck: RollTargetCheck; prettyKey: (key: string) => string }
): void {
    const nodes = html.find("input[data-dw-dblroll='save']") as JQueryWithOn<HTMLInputElement>;
    nodes.on("dblclick", async (ev: ActionEvent<HTMLInputElement>) => {
        ev.preventDefault();
        const key = ev.currentTarget.dataset.key;
        const val = Number(ev.currentTarget.value ?? 0);
        await rollTargetCheck(actor, `Save: ${prettyKey(key ?? "")}`, val);
    });
}
