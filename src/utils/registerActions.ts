import type { ActionEvent, ActionHandler, HtmlRoot } from "../types/index.js";

const actionHandlersByRoot = new WeakMap<HTMLElement, Record<string, ActionHandler>>();
const boundRoots = new WeakSet<HTMLElement>();

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
  const root = html.get(0);

  if (!(root instanceof HTMLElement)) return;

  const nextHandlers = {
    ...(actionHandlersByRoot.get(root) ?? {}),
    ...handlers
  };

  actionHandlersByRoot.set(root, nextHandlers);

  if (boundRoots.has(root)) return;

  boundRoots.add(root);

  html.on("click", async (event) => {
    const target = event.target as EventTarget | null;
    const targetElement =
      target instanceof Element ? target : target instanceof Node ? target.parentElement : null;
    const actionElement = targetElement?.closest<HTMLElement>("[data-action]") ?? null;

    if (!actionElement || !root.contains(actionElement)) return;

    const actionId = actionElement.dataset.action;

    if (!actionId) return;

    const currentHandlers = actionHandlersByRoot.get(root);
    const handler = currentHandlers?.[actionId];

    if (!handler) return;

    event.preventDefault();

    await handler(buildActionEvent(event, actionElement));
  });
}
