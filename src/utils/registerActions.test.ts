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
});
