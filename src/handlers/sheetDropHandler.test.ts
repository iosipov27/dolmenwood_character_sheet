import { describe, expect, it, vi } from "vitest";
import { SheetDropHandler } from "./sheetDropHandler.js";

function createDropEvent(markup: string, selector: string): DragEvent {
  document.body.innerHTML = markup;
  const target = document.querySelector(selector);

  if (!(target instanceof HTMLElement)) {
    throw new Error(`Missing drop target for selector: ${selector}`);
  }

  return {
    target
  } as unknown as DragEvent;
}

describe("SheetDropHandler", () => {
  it("forwards drops outside the spells tab", async () => {
    const fromDropData = vi.fn();
    const warn = vi.fn();
    const forwardDrop = vi.fn(async () => "forwarded");
    const handler = new SheetDropHandler({
      fromDropData,
      localize: (key) => key,
      warn
    });

    const result = await handler.handleItemDrop(
      createDropEvent(
        `
          <div class="tab" data-tab="main">
            <div class="target"></div>
          </div>
        `,
        ".target"
      ),
      {} as ActorSheet.DropData.Item,
      { forwardDrop }
    );

    expect(result).toBe("forwarded");
    expect(forwardDrop).toHaveBeenCalledTimes(1);
    expect(fromDropData).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
  });

  it("blocks invalid item types inside the spells tab", async () => {
    const fromDropData = vi.fn(async () => ({ type: "weapon" } as Item));
    const warn = vi.fn();
    const forwardDrop = vi.fn(async () => "forwarded");
    const handler = new SheetDropHandler({
      fromDropData,
      localize: (key) => `loc:${key}`,
      warn
    });

    const result = await handler.handleItemDrop(
      createDropEvent(
        `
          <div class="tab" data-tab="spells-abilities">
            <div data-dw-drop-kind="spell">
              <div class="target"></div>
            </div>
          </div>
        `,
        ".target"
      ),
      {} as ActorSheet.DropData.Item,
      { forwardDrop }
    );

    expect(result).toBeNull();
    expect(forwardDrop).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith("loc:DOLMENWOOD.UI.SpellsDropOnlySpells");
  });

  it("forwards matching item types inside the spells tab", async () => {
    const fromDropData = vi.fn(async () => ({ type: "spell" } as Item));
    const warn = vi.fn();
    const forwardDrop = vi.fn(async () => "forwarded");
    const handler = new SheetDropHandler({
      fromDropData,
      localize: (key) => key,
      warn
    });

    const result = await handler.handleItemDrop(
      createDropEvent(
        `
          <div class="tab" data-tab="spells-abilities">
            <div data-dw-drop-kind="spell">
              <div class="target"></div>
            </div>
          </div>
        `,
        ".target"
      ),
      {} as ActorSheet.DropData.Item,
      { forwardDrop }
    );

    expect(result).toBe("forwarded");
    expect(forwardDrop).toHaveBeenCalledTimes(1);
    expect(warn).not.toHaveBeenCalled();
  });
});
