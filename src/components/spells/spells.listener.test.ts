import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "../../test/flushPromises.js";
import { registerSpellsListener } from "./spells.listener.js";

describe("registerSpellsListener", () => {
  it("toggles collapse state for spells section", async () => {
    document.body.innerHTML = `
      <div class="dw-spells-abilities__section dw-spells-abilities__section--spells">
        <div class="dw-spells">
          <button type="button" class="dw-spells__header" data-action="dw-toggle-collapsible-section" aria-expanded="true"></button>
          <div class="dw-spells__scroll"></div>
        </div>
      </div>
    `;
    const html = $(document.body);
    const actor = { items: { get: vi.fn() } } as unknown as Actor;

    registerSpellsListener(html, actor);

    const header = html.find(".dw-spells__header");
    const block = html.find(".dw-spells");
    const section = html.find(".dw-spells-abilities__section--spells");

    header.trigger("click");
    await flushPromises();

    expect(block.hasClass("is-collapsed")).toBe(true);
    expect(section.hasClass("is-collapsed")).toBe(true);
    expect(header.attr("aria-expanded")).toBe("false");

    header.trigger("click");
    await flushPromises();

    expect(block.hasClass("is-collapsed")).toBe(false);
    expect(section.hasClass("is-collapsed")).toBe(false);
    expect(header.attr("aria-expanded")).toBe("true");
  });

  it("toggles collapse state for traits section", async () => {
    document.body.innerHTML = `
      <div class="dw-spells-abilities__section dw-spells-abilities__section--traits">
        <div class="dw-ability-items">
          <button type="button" class="dw-ability-items__header" data-action="dw-toggle-collapsible-section" aria-expanded="true"></button>
          <div class="dw-ability-items__scroll"></div>
        </div>
      </div>
    `;
    const html = $(document.body);
    const actor = { items: { get: vi.fn() } } as unknown as Actor;

    registerSpellsListener(html, actor);

    const header = html.find(".dw-ability-items__header");
    const block = html.find(".dw-ability-items");
    const section = html.find(".dw-spells-abilities__section--traits");

    header.trigger("click");
    await flushPromises();

    expect(block.hasClass("is-collapsed")).toBe(true);
    expect(section.hasClass("is-collapsed")).toBe(true);
    expect(header.attr("aria-expanded")).toBe("false");
  });
});

