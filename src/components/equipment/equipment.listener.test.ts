import { afterEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "../../test/flushPromises.js";
import { registerEquipmentListener } from "./equipment.listener.js";

function createDependencies() {
  return {
    applyDwPatch: vi.fn(async () => {}),
    fromDropData: vi.fn(async () => null),
    localize: vi.fn((key: string) => `loc:${key}`),
    warn: vi.fn()
  };
}

function createDropEvent(dropData: Record<string, unknown>) {
  const originalEvent = {
    dataTransfer: {
      dropEffect: "none",
      getData: vi.fn((format: string) => (format === "text/plain" ? JSON.stringify(dropData) : ""))
    }
  };
  const event = $.Event("drop");

  Object.assign(event, { originalEvent });

  return {
    event,
    originalEvent
  };
}

describe("registerEquipmentListener", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("calculates total weight from equipment weight inputs on init", () => {
    document.body.innerHTML = `
      <div class="dw-equipment">
        <input name="dw.meta.equipment.equippedWeight1" value="10" />
        <input name="dw.meta.equipment.stowedWeight1" value="5" />
        <div data-total-weight>0</div>
      </div>
    `;

    const html = $(document.body);

    registerEquipmentListener(html, createDependencies());

    const total = html.find("[data-total-weight]");

    expect(total.text()).toBe("15");
  });

  it("updates total weight when a weight input changes", () => {
    document.body.innerHTML = `
      <div class="dw-equipment">
        <input name="dw.meta.equipment.equippedWeight1" value="10" />
        <input name="dw.meta.equipment.stowedWeight1" value="5" />
        <div data-total-weight>0</div>
      </div>
    `;

    const html = $(document.body);

    registerEquipmentListener(html, createDependencies());

    const total = html.find("[data-total-weight]");
    const input = html.find('input[name="dw.meta.equipment.stowedWeight1"]');

    input.val("8");
    input.trigger("input");

    expect(total.text()).toBe("18");
  });

  it("updates total weight for weight fields added after listener registration", () => {
    document.body.innerHTML = `
      <div class="dw-equipment">
        <input name="dw.meta.equipment.equippedWeight1" value="10" />
        <div data-total-weight>0</div>
      </div>
    `;

    const html = $(document.body);

    registerEquipmentListener(html, createDependencies());

    html.find(".dw-equipment").append(`<input name="dw.meta.equipment.stowedWeight1" value="5" />`);

    const total = html.find("[data-total-weight]");
    const input = html.find('input[name="dw.meta.equipment.stowedWeight1"]');

    input.val("8");
    input.trigger("input");

    expect(total.text()).toBe("18");
  });

  it("calculates encumbrance from equipment weight and coins on init", () => {
    document.body.innerHTML = `
      <div class="dw-equipment">
        <input name="dw.meta.equipment.equippedWeight1" value="10" />
        <input name="dw.meta.equipment.stowedWeight1" value="5" />
        <span data-encumbrance-label>0 / 1600</span>
        <span data-encumbrance-bar style="width: 0%"></span>
      </div>
      <input name="dw.meta.coins.gold" value="30" />
      <input name="dw.meta.coins.silver" value="10" />
    `;

    const html = $(document.body);

    registerEquipmentListener(html, createDependencies());

    expect(html.find("[data-encumbrance-label]").text()).toBe("55 / 1600");
    expect(html.find("[data-encumbrance-bar]").attr("style")).toBe("width: 3.44%");
  });

  it("updates encumbrance when a coin field changes", () => {
    document.body.innerHTML = `
      <div class="dw-equipment">
        <input name="dw.meta.equipment.equippedWeight1" value="10" />
        <span data-encumbrance-label>0 / 1600</span>
        <span data-encumbrance-bar style="width: 0%"></span>
      </div>
      <input name="dw.meta.coins.gold" value="30" />
    `;

    const html = $(document.body);

    registerEquipmentListener(html, createDependencies());

    const coinsInput = html.find('input[name="dw.meta.coins.gold"]');

    coinsInput.val("90");
    coinsInput.trigger("input");

    expect(html.find("[data-encumbrance-label]").text()).toBe("100 / 1600");
    expect(html.find("[data-encumbrance-bar]").attr("style")).toBe("width: 6.25%");
  });

  it("shows tooltip for stowed item input when text is truncated", () => {
    const activate = vi.fn();
    const deactivate = vi.fn();

    vi.stubGlobal("game", {
      tooltip: { activate, deactivate }
    });

    document.body.innerHTML = `
      <div class="dw-equipment">
        <input name="dw.meta.equipment.stowed1" value="Very long stowed item name" />
        <div data-total-weight>0</div>
      </div>
    `;

    const html = $(document.body);

    registerEquipmentListener(html, createDependencies());

    const input = html.find('input[name="dw.meta.equipment.stowed1"]').get(0) as HTMLInputElement;

    Object.defineProperty(input, "clientWidth", { configurable: true, value: 40 });
    Object.defineProperty(input, "scrollWidth", { configurable: true, value: 120 });

    $(input).trigger("mouseenter");

    expect(activate).toHaveBeenCalledTimes(1);
    expect(activate).toHaveBeenCalledWith(input, { text: "Very long stowed item name" });
    expect(deactivate).not.toHaveBeenCalled();
  });

  it("does not show tooltip for stowed item input when text fits", () => {
    const activate = vi.fn();
    const deactivate = vi.fn();

    vi.stubGlobal("game", {
      tooltip: { activate, deactivate }
    });

    document.body.innerHTML = `
      <div class="dw-equipment">
        <input name="dw.meta.equipment.stowed1" value="Short" />
        <div data-total-weight>0</div>
      </div>
    `;

    const html = $(document.body);

    registerEquipmentListener(html, createDependencies());

    const input = html.find('input[name="dw.meta.equipment.stowed1"]').get(0) as HTMLInputElement;

    Object.defineProperty(input, "clientWidth", { configurable: true, value: 120 });
    Object.defineProperty(input, "scrollWidth", { configurable: true, value: 40 });

    $(input).trigger("mouseenter");

    expect(input.getAttribute("title")).toBeNull();
    expect(activate).not.toHaveBeenCalled();
    expect(deactivate).toHaveBeenCalledTimes(1);
  });

  it("deactivates tooltip when leaving stowed item input", () => {
    const activate = vi.fn();
    const deactivate = vi.fn();

    vi.stubGlobal("game", {
      tooltip: { activate, deactivate }
    });

    document.body.innerHTML = `
      <div class="dw-equipment">
        <input name="dw.meta.equipment.stowed1" value="Very long stowed item name" />
        <div data-total-weight>0</div>
      </div>
    `;

    const html = $(document.body);

    registerEquipmentListener(html, createDependencies());

    const input = html.find('input[name="dw.meta.equipment.stowed1"]').get(0) as HTMLInputElement;

    Object.defineProperty(input, "clientWidth", { configurable: true, value: 40 });
    Object.defineProperty(input, "scrollWidth", { configurable: true, value: 120 });

    $(input).trigger("mouseenter");
    $(input).trigger("mouseleave");

    expect(activate).toHaveBeenCalledTimes(1);
    expect(deactivate).toHaveBeenCalledTimes(1);
  });

  it("replaces an equipment slot with a compendium item on drop", async () => {
    const dependencies = createDependencies();

    dependencies.fromDropData.mockResolvedValue({
      type: "item",
      pack: "ose.items",
      uuid: "Compendium.ose.items.Item.sword",
      name: "Longsword",
      system: {
        weight: 2
      }
    } as unknown as Item);

    document.body.innerHTML = `
      <div class="dw-equipment">
        <div data-dw-equipment-slot="equipped1"></div>
        <div data-total-weight>0</div>
      </div>
    `;

    const html = $(document.body);

    registerEquipmentListener(html, dependencies);

    const { event, originalEvent } = createDropEvent({
      type: "Item",
      uuid: "Compendium.ose.items.Item.sword"
    });

    html.find('[data-dw-equipment-slot="equipped1"]').trigger(event);
    await flushPromises();

    expect(originalEvent.dataTransfer.getData).toHaveBeenCalledWith("text/plain");
    expect(dependencies.fromDropData).toHaveBeenCalledWith({
      type: "Item",
      uuid: "Compendium.ose.items.Item.sword"
    });
    expect(dependencies.applyDwPatch).toHaveBeenCalledWith({
      meta: {
        equipment: {
          equipped1: "Longsword",
          equippedWeight1: "2",
          equippedCompendium1: {
            uuid: "Compendium.ose.items.Item.sword",
            name: "Longsword",
            type: "item",
            weight: "2"
          }
        }
      }
    });
    expect(dependencies.warn).not.toHaveBeenCalled();
  });

  it("accepts dropped compendium entries with non-spell, non-ability item types", async () => {
    const dependencies = createDependencies();

    dependencies.fromDropData.mockResolvedValue({
      type: "weapon",
      pack: "ose.items",
      uuid: "Compendium.ose.items.Item.axe",
      name: "Axe",
      system: {
        weight: 1
      }
    } as unknown as Item);

    document.body.innerHTML = `
      <div class="dw-equipment">
        <div data-dw-equipment-slot="stowed1"></div>
        <div data-total-weight>0</div>
      </div>
    `;

    const html = $(document.body);

    registerEquipmentListener(html, dependencies);

    const { event } = createDropEvent({
      type: "Item",
      uuid: "Compendium.ose.items.Item.axe"
    });

    html.find('[data-dw-equipment-slot="stowed1"]').trigger(event);
    await flushPromises();

    expect(dependencies.applyDwPatch).toHaveBeenCalledWith({
      meta: {
        equipment: {
          stowed1: "Axe",
          stowedWeight1: "1",
          stowedCompendium1: {
            uuid: "Compendium.ose.items.Item.axe",
            name: "Axe",
            type: "weapon",
            weight: "1"
          }
        }
      }
    });
    expect(dependencies.warn).not.toHaveBeenCalled();
  });

  it("rejects dropped spells and abilities", async () => {
    const dependencies = createDependencies();

    dependencies.fromDropData.mockResolvedValue({
      type: "spell",
      pack: "ose.items",
      uuid: "Compendium.ose.items.Item.magic-missile",
      name: "Magic Missile"
    } as unknown as Item);

    document.body.innerHTML = `
      <div class="dw-equipment">
        <div data-dw-equipment-slot="stowed1"></div>
        <div data-total-weight>0</div>
      </div>
    `;

    const html = $(document.body);

    registerEquipmentListener(html, dependencies);

    const { event } = createDropEvent({
      type: "Item",
      uuid: "Compendium.ose.items.Item.magic-missile"
    });

    html.find('[data-dw-equipment-slot="stowed1"]').trigger(event);
    await flushPromises();

    expect(dependencies.applyDwPatch).not.toHaveBeenCalled();
    expect(dependencies.warn).toHaveBeenCalledWith(
      "loc:DOLMENWOOD.UI.EquipmentDropNoSpellsOrAbilities"
    );
  });

  it("rejects dropped world items when the slot only accepts compendium items", async () => {
    const dependencies = createDependencies();

    dependencies.fromDropData.mockResolvedValue({
      type: "item",
      name: "Torch",
      system: {
        weight: 1
      }
    } as unknown as Item);

    document.body.innerHTML = `
      <div class="dw-equipment">
        <div data-dw-equipment-slot="stowed2"></div>
        <div data-total-weight>0</div>
      </div>
    `;

    const html = $(document.body);

    registerEquipmentListener(html, dependencies);

    const { event } = createDropEvent({
      type: "Item",
      uuid: "Item.world-torch"
    });

    html.find('[data-dw-equipment-slot="stowed2"]').trigger(event);
    await flushPromises();

    expect(dependencies.applyDwPatch).not.toHaveBeenCalled();
    expect(dependencies.warn).toHaveBeenCalledWith(
      "loc:DOLMENWOOD.UI.EquipmentDropOnlyCompendiumItems"
    );
  });

  it("removes a compendium item slot back to an empty input state", async () => {
    const dependencies = createDependencies();

    document.body.innerHTML = `
      <div class="dw-equipment">
        <button type="button" data-dw-equipment-remove="stowed3">x</button>
        <div data-total-weight>0</div>
      </div>
    `;

    const html = $(document.body);

    registerEquipmentListener(html, dependencies);

    html.find('[data-dw-equipment-remove="stowed3"]').trigger("click");
    await flushPromises();

    expect(dependencies.applyDwPatch).toHaveBeenCalledWith({
      meta: {
        equipment: {
          stowed3: "",
          stowedWeight3: "",
          stowedCompendium3: {
            uuid: "",
            name: "",
            type: "",
            weight: ""
          }
        }
      }
    });
  });
});
