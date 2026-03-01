import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "../../test/flushPromises.js";
import { registerSpellsListener } from "./spells.listener.js";
import type { DwFlags } from "../../types.js";

describe("registerSpellsListener", () => {
  it("applies saved collapsed states on init", () => {
    document.body.innerHTML = `
      <div class="tab" data-tab="spells-abilities">
        <section class="dw-spells-abilities">
          <div class="dw-spells-abilities__section dw-spells-abilities__section--spells">
            <div class="dw-spells">
              <div class="dw-spells__header" data-action="dw-toggle-collapsible-section" aria-expanded="true"></div>
              <div class="dw-spells__scroll"></div>
            </div>
          </div>

          <div class="dw-spells-abilities__section dw-spells-abilities__section--traits">
            <div class="dw-ability-items">
              <div class="dw-ability-items__header" data-action="dw-toggle-collapsible-section" aria-expanded="true"></div>
              <div class="dw-ability-items__scroll"></div>
            </div>
          </div>
        </section>
      </div>
    `;
    const html = $(document.body);
    const actor = { items: { get: vi.fn() } } as unknown as Actor;
    const getDwFlags = vi.fn(
      () => ({ meta: { spellsCollapsed: true, traitsCollapsed: false } }) as unknown as DwFlags
    );
    const setDwFlags = vi.fn(async () => {});

    registerSpellsListener(html, { actor, getDwFlags, setDwFlags });

    expect(html.find(".dw-spells").hasClass("is-collapsed")).toBe(true);
    expect(html.find(".dw-spells-abilities__section--spells").hasClass("is-collapsed")).toBe(true);
    expect(html.find(".dw-spells__header").attr("aria-expanded")).toBe("false");
    expect(html.find(".dw-spells-abilities").hasClass("dw-spells-abilities--cards-collapsed")).toBe(true);

    expect(html.find(".dw-ability-items").hasClass("is-collapsed")).toBe(false);
    expect(html.find(".dw-ability-items__header").attr("aria-expanded")).toBe("true");
  });

  it("toggles collapse state for spells section", async () => {
    document.body.innerHTML = `
      <div class="tab" data-tab="spells-abilities">
      <section class="dw-spells-abilities">
        <div class="dw-spells-abilities__section dw-spells-abilities__section--spells">
          <div class="dw-spells">
            <div class="dw-spells__header" data-action="dw-toggle-collapsible-section" aria-expanded="true"></div>
            <div class="dw-spells__scroll"></div>
          </div>
        </div>
      </section>
      </div>
    `;
    const html = $(document.body);
    const actor = { items: { get: vi.fn() } } as unknown as Actor;
    const dw = { meta: { spellsCollapsed: false, traitsCollapsed: false } } as unknown as DwFlags;
    const getDwFlags = vi.fn(() => dw);
    const setDwFlags = vi.fn(async () => {});

    registerSpellsListener(html, { actor, getDwFlags, setDwFlags });

    const header = html.find(".dw-spells__header");
    const block = html.find(".dw-spells");
    const section = html.find(".dw-spells-abilities__section--spells");
    const container = html.find(".dw-spells-abilities");

    header.trigger("click");
    await flushPromises();

    expect(block.hasClass("is-collapsed")).toBe(true);
    expect(section.hasClass("is-collapsed")).toBe(true);
    expect(header.attr("aria-expanded")).toBe("false");
    expect(container.hasClass("dw-spells-abilities--cards-collapsed")).toBe(true);
    expect(dw.meta.spellsCollapsed).toBe(true);
    expect(setDwFlags).toHaveBeenCalledWith(dw);

    header.trigger("click");
    await flushPromises();

    expect(block.hasClass("is-collapsed")).toBe(false);
    expect(section.hasClass("is-collapsed")).toBe(false);
    expect(header.attr("aria-expanded")).toBe("true");
    expect(container.hasClass("dw-spells-abilities--cards-collapsed")).toBe(false);
    expect(dw.meta.spellsCollapsed).toBe(false);
  });

  it("toggles collapse state for traits section", async () => {
    document.body.innerHTML = `
      <div class="tab" data-tab="spells-abilities">
      <section class="dw-spells-abilities">
        <div class="dw-spells-abilities__section dw-spells-abilities__section--traits">
          <div class="dw-ability-items">
            <div class="dw-ability-items__header" data-action="dw-toggle-collapsible-section" aria-expanded="true"></div>
            <div class="dw-ability-items__scroll"></div>
          </div>
        </div>
      </section>
      </div>
    `;
    const html = $(document.body);
    const actor = { items: { get: vi.fn() } } as unknown as Actor;
    const dw = { meta: { spellsCollapsed: false, traitsCollapsed: false } } as unknown as DwFlags;
    const getDwFlags = vi.fn(() => dw);
    const setDwFlags = vi.fn(async () => {});

    registerSpellsListener(html, { actor, getDwFlags, setDwFlags });

    const header = html.find(".dw-ability-items__header");
    const block = html.find(".dw-ability-items");
    const section = html.find(".dw-spells-abilities__section--traits");
    const container = html.find(".dw-spells-abilities");

    header.trigger("click");
    await flushPromises();

    expect(block.hasClass("is-collapsed")).toBe(true);
    expect(section.hasClass("is-collapsed")).toBe(true);
    expect(header.attr("aria-expanded")).toBe("false");
    expect(container.hasClass("dw-spells-abilities--cards-collapsed")).toBe(true);
    expect(dw.meta.traitsCollapsed).toBe(true);
    expect(setDwFlags).toHaveBeenCalledWith(dw);
  });
});
