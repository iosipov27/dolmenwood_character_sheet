import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "../test/flushPromises.js";
import { registerFormChangeListener } from "./registerFormChangeListener.js";

describe("registerFormChangeListener", () => {
  it("prevents form submit", () => {
    document.body.innerHTML = `
      <form class="dw-form">
        <input name="name" value="Rook" />
      </form>
    `;

    const html = $(".dw-form");

    registerFormChangeListener(html, {
      onFieldChange: vi.fn()
    });

    const event = $.Event("submit");

    html.trigger(event);

    expect(event.isDefaultPrevented()).toBe(true);
  });

  it("emits text field changes", async () => {
    document.body.innerHTML = `
      <form class="dw-form">
        <input name="name" value="Rook" />
      </form>
    `;

    const onFieldChange = vi.fn();
    const html = $(".dw-form");

    registerFormChangeListener(html, { onFieldChange });

    html.find("input").trigger("change");
    await flushPromises();

    expect(onFieldChange).toHaveBeenCalledWith("name", "Rook");
  });

  it("converts blank number input to null", async () => {
    document.body.innerHTML = `
      <form class="dw-form">
        <input type="number" name="dw.meta.xp" value="" />
      </form>
    `;

    const onFieldChange = vi.fn();
    const html = $(".dw-form");

    registerFormChangeListener(html, { onFieldChange });

    html.find("input").trigger("change");
    await flushPromises();

    expect(onFieldChange).toHaveBeenCalledWith("dw.meta.xp", null);
  });

  it("emits checkbox state as boolean", async () => {
    document.body.innerHTML = `
      <form class="dw-form">
        <input type="checkbox" name="dw.meta.spellsCollapsed" />
      </form>
    `;

    const onFieldChange = vi.fn();
    const html = $(".dw-form");
    const input = html.find("input");

    registerFormChangeListener(html, { onFieldChange });

    input.prop("checked", true);
    input.trigger("change");
    await flushPromises();

    expect(onFieldChange).toHaveBeenCalledWith("dw.meta.spellsCollapsed", true);
  });
});
