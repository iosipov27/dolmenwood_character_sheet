import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "../../test/flushPromises.js";
import { registerSpellsTraitsViewListener } from "./spells-traits-view.listener.js";
import type { DwFlags, DwSpellsTraitsView } from "../../types.js";

function buildDw(mode: DwSpellsTraitsView = "both"): DwFlags {
  return {
    meta: {
      spellsTraitsView: mode
    }
  } as DwFlags;
}

describe("registerSpellsTraitsViewListener", () => {
  it("defaults to both mode when saved value is invalid", () => {
    document.body.innerHTML = `
      <div class="tab" data-tab="spells-abilities">
        <section class="dw-spells-abilities dw-spells-abilities--view-cards">
          <button data-action="dw-set-spells-traits-view" data-view="cards"></button>
          <button data-action="dw-set-spells-traits-view" data-view="text"></button>
        </section>
      </div>
    `;
    const html = $(document.body);
    const getDwFlags = vi.fn(() => buildDw("both"));
    const setDwFlags = vi.fn(async () => {});

    getDwFlags.mockReturnValueOnce({ meta: { spellsTraitsView: "invalid" } } as DwFlags);

    registerSpellsTraitsViewListener(html, { getDwFlags, setDwFlags });

    const container = html.find(".dw-spells-abilities");
    const buttons = html.find("[data-action='dw-set-spells-traits-view']");
    const cardsButton = buttons.filter("[data-view='cards']");
    const textButton = buttons.filter("[data-view='text']");

    expect(container.hasClass("dw-spells-abilities--view-both")).toBe(true);
    expect(container.hasClass("dw-spells-abilities--view-cards")).toBe(false);
    expect(cardsButton.hasClass("is-active")).toBe(true);
    expect(textButton.hasClass("is-active")).toBe(true);
  });

  it("applies saved mode on init", () => {
    document.body.innerHTML = `
      <div class="tab" data-tab="spells-abilities">
        <section class="dw-spells-abilities dw-spells-abilities--view-both">
          <button data-action="dw-set-spells-traits-view" data-view="cards"></button>
          <button data-action="dw-set-spells-traits-view" data-view="text"></button>
        </section>
      </div>
    `;
    const html = $(document.body);
    const getDwFlags = vi.fn(() => buildDw("text"));
    const setDwFlags = vi.fn(async () => {});

    registerSpellsTraitsViewListener(html, { getDwFlags, setDwFlags });

    const container = html.find(".dw-spells-abilities");
    const cardsButton = html.find("[data-view='cards']");
    const textButton = html.find("[data-view='text']");

    expect(container.hasClass("dw-spells-abilities--view-text")).toBe(true);
    expect(cardsButton.hasClass("is-active")).toBe(false);
    expect(textButton.hasClass("is-active")).toBe(true);
  });

  it("switches from both to text and saves selected value", async () => {
    document.body.innerHTML = `
      <div class="tab" data-tab="spells-abilities">
        <section class="dw-spells-abilities dw-spells-abilities--view-both">
          <button class="is-active" data-action="dw-set-spells-traits-view" data-view="cards"></button>
          <button class="is-active" data-action="dw-set-spells-traits-view" data-view="text"></button>
        </section>
      </div>
    `;
    const html = $(document.body);
    const dw = buildDw("both");
    const getDwFlags = vi.fn(() => dw);
    const setDwFlags = vi.fn(async () => {});

    registerSpellsTraitsViewListener(html, { getDwFlags, setDwFlags });

    const cardsButton = html.find("[data-view='cards']");
    const textButton = html.find("[data-view='text']");
    const container = html.find(".dw-spells-abilities");

    cardsButton.trigger("click");
    await flushPromises();

    expect(container.hasClass("dw-spells-abilities--view-text")).toBe(true);
    expect(cardsButton.hasClass("is-active")).toBe(false);
    expect(textButton.hasClass("is-active")).toBe(true);
    expect(dw.meta.spellsTraitsView).toBe("text");
    expect(setDwFlags).toHaveBeenCalledWith(dw);
  });

  it("switches from text to both when second toggle is enabled", async () => {
    document.body.innerHTML = `
      <div class="tab" data-tab="spells-abilities">
        <section class="dw-spells-abilities dw-spells-abilities--view-text">
          <button data-action="dw-set-spells-traits-view" data-view="cards"></button>
          <button class="is-active" data-action="dw-set-spells-traits-view" data-view="text"></button>
        </section>
      </div>
    `;
    const html = $(document.body);
    const dw = buildDw("text");
    const getDwFlags = vi.fn(() => dw);
    const setDwFlags = vi.fn(async () => {});

    registerSpellsTraitsViewListener(html, { getDwFlags, setDwFlags });

    const cardsButton = html.find("[data-view='cards']");
    const textButton = html.find("[data-view='text']");
    const container = html.find(".dw-spells-abilities");

    cardsButton.trigger("click");
    await flushPromises();

    expect(container.hasClass("dw-spells-abilities--view-both")).toBe(true);
    expect(cardsButton.hasClass("is-active")).toBe(true);
    expect(textButton.hasClass("is-active")).toBe(true);
    expect(dw.meta.spellsTraitsView).toBe("both");
    expect(setDwFlags).toHaveBeenCalledWith(dw);
  });

  it("does not allow disabling the last active toggle", async () => {
    document.body.innerHTML = `
      <div class="tab" data-tab="spells-abilities">
        <section class="dw-spells-abilities dw-spells-abilities--view-cards">
          <button class="is-active" data-action="dw-set-spells-traits-view" data-view="cards"></button>
          <button data-action="dw-set-spells-traits-view" data-view="text"></button>
        </section>
      </div>
    `;
    const html = $(document.body);
    const dw = buildDw("cards");
    const getDwFlags = vi.fn(() => dw);
    const setDwFlags = vi.fn(async () => {});

    registerSpellsTraitsViewListener(html, { getDwFlags, setDwFlags });

    const cardsButton = html.find("[data-view='cards']");
    const container = html.find(".dw-spells-abilities");

    cardsButton.trigger("click");
    await flushPromises();

    expect(container.hasClass("dw-spells-abilities--view-cards")).toBe(true);
    expect(cardsButton.hasClass("is-active")).toBe(true);
    expect(dw.meta.spellsTraitsView).toBe("cards");
    expect(setDwFlags).not.toHaveBeenCalled();
  });

  it("ignores invalid mode value", async () => {
    document.body.innerHTML = `
      <div class="tab" data-tab="spells-abilities">
        <section class="dw-spells-abilities dw-spells-abilities--view-both">
          <button class="is-active" data-action="dw-set-spells-traits-view" data-view="cards"></button>
          <button class="is-active" data-action="dw-set-spells-traits-view" data-view="text"></button>
          <button data-action="dw-set-spells-traits-view" data-view="invalid"></button>
        </section>
      </div>
    `;
    const html = $(document.body);
    const dw = buildDw("both");
    const getDwFlags = vi.fn(() => dw);
    const setDwFlags = vi.fn(async () => {});

    registerSpellsTraitsViewListener(html, { getDwFlags, setDwFlags });

    const invalidButton = html.find("[data-view='invalid']");
    const container = html.find(".dw-spells-abilities");

    invalidButton.trigger("click");
    await flushPromises();

    expect(container.hasClass("dw-spells-abilities--view-both")).toBe(true);
    expect(setDwFlags).not.toHaveBeenCalled();
  });
});
