import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "../test/flushPromises.js";
import { registerActions } from "./registerActions.js";

describe("registerActions", () => {
  it("dispatches by data-action and uses the closest action element as currentTarget", async () => {
    document.body.innerHTML = `
      <div class="root">
        <button data-action="dw-test" data-value="42">
          <span class="inner">Click</span>
        </button>
      </div>
    `;

    const html = $(".root");
    const handler = vi.fn();

    registerActions(html, {
      "dw-test": handler
    });

    html.find(".inner").trigger("click");
    await flushPromises();

    expect(handler).toHaveBeenCalledTimes(1);

    const [event] = handler.mock.calls[0] as [Event];
    const currentTarget = event.currentTarget;

    expect(currentTarget).toBeInstanceOf(HTMLElement);
    expect((currentTarget as HTMLElement).dataset.action).toBe("dw-test");
    expect((currentTarget as HTMLElement).dataset.value).toBe("42");
  });

  it("ignores unknown actions", async () => {
    document.body.innerHTML = `
      <div class="root">
        <button data-action="dw-unknown">
          <span class="inner">Click</span>
        </button>
      </div>
    `;

    const html = $(".root");
    const handler = vi.fn();

    registerActions(html, {
      "dw-known": handler
    });

    html.find(".inner").trigger("click");
    await flushPromises();

    expect(handler).not.toHaveBeenCalled();
  });

  it("merges handlers registered in separate calls on the same root", async () => {
    document.body.innerHTML = `
      <div class="root">
        <button data-action="dw-first"><span class="first-inner">First</span></button>
        <button data-action="dw-second"><span class="second-inner">Second</span></button>
      </div>
    `;

    const html = $(".root");
    const firstHandler = vi.fn();
    const secondHandler = vi.fn();

    registerActions(html, {
      "dw-first": firstHandler
    });
    registerActions(html, {
      "dw-second": secondHandler
    });

    html.find(".first-inner").trigger("click");
    html.find(".second-inner").trigger("click");
    await flushPromises();

    expect(firstHandler).toHaveBeenCalledTimes(1);
    expect(secondHandler).toHaveBeenCalledTimes(1);
  });
});
