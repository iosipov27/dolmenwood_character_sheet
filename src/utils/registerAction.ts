import type { ActionHandler, ActionEvent, HtmlRoot, JQueryWithOn } from "../types/index.js";

export function registerAction(html: HtmlRoot, actionId: string, handler: ActionHandler): void {
  const nodes = html.find(`[data-action='${actionId}']`) as JQueryWithOn;

  nodes.on("click", async (ev: ActionEvent) => {
    ev.preventDefault();
    await handler(ev);
  });
}
