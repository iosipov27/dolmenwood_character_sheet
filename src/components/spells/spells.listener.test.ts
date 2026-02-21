import { afterEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "../../test/flushPromises.js";
import { registerSpellsListener } from "./spells.listener.js";
import type { DwFlags } from "../../types.js";

describe("registerSpellsListener", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("applies saved collapsed states on init", () => {
    document.body.innerHTML = `
      <div data-tab-panel="spells-abilities">
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
      <div data-tab-panel="spells-abilities">
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
      <div data-tab-panel="spells-abilities">
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

  it("sends spell card to chat via item.show", async () => {
    document.body.innerHTML = `
      <div data-tab-panel="spells-abilities">
        <section class="dw-spells-abilities">
          <div class="dw-spells">
            <button data-action="dw-send-spell-to-chat" data-item-id="spell-1"></button>
          </div>
        </section>
      </div>
    `;

    const html = $(document.body);
    const show = vi.fn(async () => {});
    const actor = {
      items: {
        get: vi.fn(() => ({ id: "spell-1", name: "Illusion", show }))
      }
    } as unknown as Actor;

    registerSpellsListener(html, {
      actor,
      getDwFlags: () => ({ meta: { spellsCollapsed: false, traitsCollapsed: false } }) as unknown as DwFlags,
      setDwFlags: vi.fn(async () => {})
    });

    html.find("[data-action='dw-send-spell-to-chat']").trigger("click");
    await flushPromises();

    expect(show).toHaveBeenCalledTimes(1);
  });

  it("uses item.roll for spell chat card + roll", async () => {
    document.body.innerHTML = `
      <div data-tab-panel="spells-abilities">
        <section class="dw-spells-abilities">
          <div class="dw-spells">
            <button data-action="dw-roll-spell-formula" data-item-id="spell-1" data-roll-formula="1d4"></button>
          </div>
        </section>
      </div>
    `;

    const html = $(document.body);
    const roll = vi.fn(async () => {});
    vi.stubGlobal("CONST", {
      DICE_ROLL_MODES: {
        PUBLIC: "publicroll"
      }
    });

    const actor = {
      items: {
        get: vi.fn(() => ({ id: "spell-1", name: "Illusion", roll }))
      }
    } as unknown as Actor;

    registerSpellsListener(html, {
      actor,
      getDwFlags: () => ({ meta: { spellsCollapsed: false, traitsCollapsed: false } }) as unknown as DwFlags,
      setDwFlags: vi.fn(async () => {})
    });

    html.find("[data-action='dw-roll-spell-formula']").trigger("click");
    await flushPromises();

    expect(roll).toHaveBeenCalledWith(
      expect.objectContaining({
        skipDialog: true,
        chatMessage: true,
        rollMode: "publicroll"
      })
    );
  });

  it("falls back to raw roll message when item.roll is unavailable", async () => {
    document.body.innerHTML = `
      <div data-tab-panel="spells-abilities">
        <section class="dw-spells-abilities">
          <div class="dw-spells">
            <button data-action="dw-roll-spell-formula" data-item-id="spell-1" data-roll-formula="1d4"></button>
          </div>
        </section>
      </div>
    `;

    const html = $(document.body);
    const toMessage = vi.fn(async () => {});
    const evaluate = vi.fn(async () => ({ toMessage }));
    const RollMock = vi.fn(() => ({ evaluate })) as unknown as {
      new (formula: string): { evaluate: () => Promise<{ toMessage: typeof toMessage }> };
      validate: (formula: string) => boolean;
    };

    RollMock.validate = vi.fn(() => true);

    vi.stubGlobal("Roll", RollMock);
    vi.stubGlobal("ChatMessage", {
      getSpeaker: vi.fn(() => ({ actor: "actor-id" }))
    });
    vi.stubGlobal("CONST", {
      DICE_ROLL_MODES: {
        PUBLIC: "publicroll"
      }
    });

    const actor = {
      items: {
        get: vi.fn(() => ({ id: "spell-1", name: "Illusion" }))
      }
    } as unknown as Actor;

    registerSpellsListener(html, {
      actor,
      getDwFlags: () => ({ meta: { spellsCollapsed: false, traitsCollapsed: false } }) as unknown as DwFlags,
      setDwFlags: vi.fn(async () => {})
    });

    html.find("[data-action='dw-roll-spell-formula']").trigger("click");
    await flushPromises();

    expect(RollMock).toHaveBeenCalledWith("1d4");
    expect(toMessage).toHaveBeenCalledWith(
      expect.objectContaining({ flavor: "Illusion: 1d4" }),
      expect.objectContaining({ rollMode: "publicroll" })
    );
  });
});
