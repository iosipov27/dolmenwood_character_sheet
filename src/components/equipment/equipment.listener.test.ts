import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "../../test/flushPromises.js";
import { registerEquipmentListener } from "./equipment.listener.js";
import type { DwFlags } from "../../types.js";

function buildDwFlags(): DwFlags {
  return {
    saves: { doom: 1, hold: 1, spell: 1, ray: 1, blast: 1, magic: 1 },
    skills: { listen: 1, search: 1, survival: 1 },
    extraSkills: [],
    movement: { speed: 120, exploring: 40, overland: 24 },
    combat: { attack: 0 },
    meta: {
      kindredClass: "",
      kindredClassTraits: "",
      background: "",
      alignment: "",
      affiliation: "",
      moonSign: "",
      languages: "",
      equipment: {
        tinyItems: "Rope, Torch",
        equipped1: "",
        equipped2: "",
        equipped3: "",
        equipped4: "",
        equipped5: "",
        equipped6: "",
        equipped7: "",
        equipped8: "",
        equipped9: "",
        equipped10: "",
        stowed1: "",
        stowed2: "",
        stowed3: "",
        stowed4: "",
        stowed5: "",
        stowed6: "",
        stowed7: "",
        stowed8: "",
        stowed9: "",
        stowed10: "",
        stowed11: "",
        stowed12: "",
        stowed13: "",
        stowed14: "",
        stowed15: "",
        stowed16: ""
      },
      xp: 0,
      level: 1,
      nextLevel: 2000,
      modifier: 0
    }
  };
}

describe("registerEquipmentListener", () => {
  it("updates equipment field on blur", async () => {
    document.body.innerHTML = `
      <div class="dw-equipment">
        <input class="edit-input" name="dw.meta.equipment.equipped1" value="" />
      </div>
      <div class="dw-equipment__tiny-display">
        <div class="dw-equipment__tiny-content"></div>
      </div>
      <textarea class="dw-equipment__textarea" name="dw.meta.equipment.tinyItems"></textarea>
    `;

    const html = $(document.body);
    const getDwFlags = vi.fn(buildDwFlags);
    const setDwFlags = vi.fn(async () => {});

    registerEquipmentListener(html, { getDwFlags, setDwFlags });

    const input = html.find('input[name="dw.meta.equipment.equipped1"]');
    input.val("Sword");
    input.trigger("blur");
    await flushPromises();

    expect(setDwFlags).toHaveBeenCalledTimes(1);
    expect(setDwFlags).toHaveBeenCalledWith(
      expect.objectContaining({
        meta: expect.objectContaining({
          equipment: expect.objectContaining({ equipped1: "Sword" })
        })
      })
    );
  });

  it("updates equipment field on change", async () => {
    document.body.innerHTML = `
      <div class="dw-equipment">
        <input class="edit-input" name="dw.meta.equipment.stowed1" value="" />
      </div>
      <div class="dw-equipment__tiny-display">
        <div class="dw-equipment__tiny-content"></div>
      </div>
      <textarea class="dw-equipment__textarea" name="dw.meta.equipment.tinyItems"></textarea>
    `;

    const html = $(document.body);
    const getDwFlags = vi.fn(buildDwFlags);
    const setDwFlags = vi.fn(async () => {});

    registerEquipmentListener(html, { getDwFlags, setDwFlags });

    const input = html.find('input[name="dw.meta.equipment.stowed1"]');
    input.val("Rations");
    input.trigger("change");
    await flushPromises();

    expect(setDwFlags).toHaveBeenCalledTimes(1);
    expect(setDwFlags).toHaveBeenCalledWith(
      expect.objectContaining({
        meta: expect.objectContaining({
          equipment: expect.objectContaining({ stowed1: "Rations" })
        })
      })
    );
  });

  it("opens tiny items textarea on display click", () => {
    document.body.innerHTML = `
      <div class="dw-equipment"></div>
      <div class="dw-equipment__tiny-display" style="display:block;">
        <div class="dw-equipment__tiny-content">Rope, Torch</div>
      </div>
      <textarea class="dw-equipment__textarea" name="dw.meta.equipment.tinyItems" style="display:none;"></textarea>
    `;

    const html = $(document.body);
    const getDwFlags = vi.fn(buildDwFlags);
    const setDwFlags = vi.fn(async () => {});

    registerEquipmentListener(html, { getDwFlags, setDwFlags });

    const display = html.find(".dw-equipment__tiny-display");
    const textarea = html.find(".dw-equipment__textarea");

    display.trigger("click");

    expect(textarea.val()).toBe("Rope, Torch");
    expect(textarea.css("display")).not.toBe("none");
    expect(display.css("display")).toBe("none");
  });

  it("saves tiny items on textarea blur", async () => {
    document.body.innerHTML = `
      <div class="dw-equipment"></div>
      <div class="dw-equipment__tiny-display">
        <div class="dw-equipment__tiny-content">Rope, Torch</div>
      </div>
      <textarea class="dw-equipment__textarea" name="dw.meta.equipment.tinyItems" style="display:none;"></textarea>
    `;

    const html = $(document.body);
    const getDwFlags = vi.fn(buildDwFlags);
    const setDwFlags = vi.fn(async () => {});

    registerEquipmentListener(html, { getDwFlags, setDwFlags });

    const display = html.find(".dw-equipment__tiny-display");
    const content = html.find(".dw-equipment__tiny-content");
    const textarea = html.find(".dw-equipment__textarea");

    display.trigger("click");
    textarea.val("Lamp, Oil");
    textarea.trigger("blur");
    await flushPromises();

    expect(setDwFlags).toHaveBeenCalledTimes(1);
    expect(setDwFlags).toHaveBeenCalledWith(
      expect.objectContaining({
        meta: expect.objectContaining({
          equipment: expect.objectContaining({ tinyItems: "Lamp, Oil" })
        })
      })
    );
    expect(content.html()).toBe("Lamp, Oil");
    expect(textarea.css("display")).toBe("none");
    expect(display.css("display")).not.toBe("none");
  });

  it("converts newlines to <br> tags when saving tiny items", async () => {
    document.body.innerHTML = `
      <div class="dw-equipment"></div>
      <div class="dw-equipment__tiny-display">
        <div class="dw-equipment__tiny-content"></div>
      </div>
      <textarea class="dw-equipment__textarea" name="dw.meta.equipment.tinyItems" style="display:none;"></textarea>
    `;

    const html = $(document.body);
    const getDwFlags = vi.fn(buildDwFlags);
    const setDwFlags = vi.fn(async () => {});

    registerEquipmentListener(html, { getDwFlags, setDwFlags });

    const display = html.find(".dw-equipment__tiny-display");
    const content = html.find(".dw-equipment__tiny-content");
    const textarea = html.find(".dw-equipment__textarea");

    display.trigger("click");
    textarea.val("Line 1\nLine 2\nLine 3");
    textarea.trigger("blur");
    await flushPromises();

    expect(content.html()).toBe("Line 1<br>Line 2<br>Line 3");
    expect(setDwFlags).toHaveBeenCalledWith(
      expect.objectContaining({
        meta: expect.objectContaining({
          equipment: expect.objectContaining({ tinyItems: "Line 1\nLine 2\nLine 3" })
        })
      })
    );
  });

  it("closes tiny items textarea on Enter key", async () => {
    document.body.innerHTML = `
      <div class="dw-equipment"></div>
      <div class="dw-equipment__tiny-display">
        <div class="dw-equipment__tiny-content"></div>
      </div>
      <textarea class="dw-equipment__textarea" name="dw.meta.equipment.tinyItems" style="display:none;"></textarea>
    `;

    const html = $(document.body);
    const getDwFlags = vi.fn(buildDwFlags);
    const setDwFlags = vi.fn(async () => {});

    registerEquipmentListener(html, { getDwFlags, setDwFlags });

    const display = html.find(".dw-equipment__tiny-display");
    const textarea = html.find(".dw-equipment__textarea");

    display.trigger("click");
    textarea.val("New items");

    const enterEvent = $.Event("keydown", { key: "Enter", shiftKey: false });
    textarea.trigger(enterEvent);
    await flushPromises();

    expect(enterEvent.isDefaultPrevented()).toBe(true);
    expect(setDwFlags).toHaveBeenCalledTimes(1);
  });

  it("does not close tiny items textarea on Shift+Enter", async () => {
    document.body.innerHTML = `
      <div class="dw-equipment"></div>
      <div class="dw-equipment__tiny-display">
        <div class="dw-equipment__tiny-content"></div>
      </div>
      <textarea class="dw-equipment__textarea" name="dw.meta.equipment.tinyItems" style="display:none;"></textarea>
    `;

    const html = $(document.body);
    const getDwFlags = vi.fn(buildDwFlags);
    const setDwFlags = vi.fn(async () => {});

    registerEquipmentListener(html, { getDwFlags, setDwFlags });

    const display = html.find(".dw-equipment__tiny-display");
    const textarea = html.find(".dw-equipment__textarea");

    display.trigger("click");
    textarea.val("New items");

    const shiftEnterEvent = $.Event("keydown", { key: "Enter", shiftKey: true });
    textarea.trigger(shiftEnterEvent);
    await flushPromises();

    expect(shiftEnterEvent.isDefaultPrevented()).toBe(false);
    expect(setDwFlags).not.toHaveBeenCalled();
  });

  it("gets value from flags when opening textarea", () => {
    document.body.innerHTML = `
      <div class="dw-equipment"></div>
      <div class="dw-equipment__tiny-display" style="display:block;">
        <div class="dw-equipment__tiny-content">Old content</div>
      </div>
      <textarea class="dw-equipment__textarea" name="dw.meta.equipment.tinyItems" style="display:none;"></textarea>
    `;

    const html = $(document.body);
    const customFlags = buildDwFlags();
    customFlags.meta.equipment.tinyItems = "Value from flags";
    const getDwFlags = vi.fn(() => customFlags);
    const setDwFlags = vi.fn(async () => {});

    registerEquipmentListener(html, { getDwFlags, setDwFlags });

    const display = html.find(".dw-equipment__tiny-display");
    const textarea = html.find(".dw-equipment__textarea");

    display.trigger("click");

    expect(textarea.val()).toBe("Value from flags");
    expect(getDwFlags).toHaveBeenCalled();
  });
});
