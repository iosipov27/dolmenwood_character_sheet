import type { ActionEvent, ActionHandler, HtmlRoot } from "../types.js";

function buildActionEvent(
  event: JQuery.TriggeredEvent,
  currentTarget: HTMLElement
): ActionEvent<HTMLElement> {
  return {
    currentTarget,
    target: event.target ?? currentTarget,
    preventDefault: () => {
      event.preventDefault();
    }
  } as unknown as ActionEvent<HTMLElement>;
}

export function registerActions(
  html: HtmlRoot,
  handlers: Record<string, ActionHandler>
): void {
  const nodes = html.find("[data-action]");

  nodes.on("click", async (event) => {
    const target = event.target as EventTarget | null;
    const currentTarget = event.currentTarget;
    const targetElement =
      target instanceof Element ? target : target instanceof Node ? target.parentElement : null;
    const actionElement = targetElement?.closest<HTMLElement>("[data-action]") ?? null;

    if (!actionElement) return;
    if (!(currentTarget instanceof HTMLElement)) return;
    if (actionElement !== currentTarget) return;

    const actionId = actionElement.dataset.action;

    if (!actionId) return;

    const handler = handlers[actionId];

    if (!handler) return;

    event.preventDefault();

    await handler(buildActionEvent(event, actionElement));
  });
}
