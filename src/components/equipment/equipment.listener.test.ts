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
        <div class="dw-equipment__tiny-editable contenteditable" contenteditable="plaintext-only"></div>
      </div>
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
        <div class="dw-equipment__tiny-editable contenteditable" contenteditable="plaintext-only"></div>
      </div>
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

  it("saves tiny items from contenteditable on blur", async () => {
    document.body.innerHTML = `
      <div class="dw-equipment">
        <div
          class="dw-equipment__tiny-editable contenteditable"
          contenteditable="plaintext-only"
          data-field="tinyItems"
        >Rope, Torch</div>
      </div>
    `;

    const html = $(document.body);
    const getDwFlags = vi.fn(buildDwFlags);
    const setDwFlags = vi.fn(async () => {});

    registerEquipmentListener(html, { getDwFlags, setDwFlags });

    const editable = html.find(".dw-equipment__tiny-editable").get(0) as HTMLElement;

    editable.innerText = "Lamp, Oil";
    $(editable).trigger("blur");
    await flushPromises();

    expect(setDwFlags).toHaveBeenCalledTimes(1);
    expect(setDwFlags).toHaveBeenCalledWith(
      expect.objectContaining({
        meta: expect.objectContaining({
          equipment: expect.objectContaining({ tinyItems: "Lamp, Oil" })
        })
      })
    );
    expect(editable.textContent).toBe("Lamp, Oil");
  });

  it("keeps multiline tiny items as plain text", async () => {
    document.body.innerHTML = `
      <div class="dw-equipment">
        <div
          class="dw-equipment__tiny-editable contenteditable"
          contenteditable="plaintext-only"
          data-field="tinyItems"
        ></div>
      </div>
    `;

    const html = $(document.body);
    const getDwFlags = vi.fn(buildDwFlags);
    const setDwFlags = vi.fn(async () => {});

    registerEquipmentListener(html, { getDwFlags, setDwFlags });

    const editable = html.find(".dw-equipment__tiny-editable").get(0) as HTMLElement;

    editable.innerText = "Line 1\nLine 2\nLine 3";
    $(editable).trigger("blur");
    await flushPromises();

    expect(editable.textContent).toBe("Line 1\nLine 2\nLine 3");
    expect(setDwFlags).toHaveBeenCalledWith(
      expect.objectContaining({
        meta: expect.objectContaining({
          equipment: expect.objectContaining({ tinyItems: "Line 1\nLine 2\nLine 3" })
        })
      })
    );
  });

  it("normalizes leading/trailing whitespace for tiny items", async () => {
    document.body.innerHTML = `
      <div class="dw-equipment">
        <div
          class="dw-equipment__tiny-editable contenteditable"
          contenteditable="plaintext-only"
          data-field="tinyItems"
        ></div>
      </div>
    `;

    const html = $(document.body);
    const getDwFlags = vi.fn(buildDwFlags);
    const setDwFlags = vi.fn(async () => {});

    registerEquipmentListener(html, { getDwFlags, setDwFlags });

    const editable = html.find(".dw-equipment__tiny-editable").get(0) as HTMLElement;
    editable.innerText = "\n\nItem 1\nItem 2   ";
    $(editable).trigger("blur");
    await flushPromises();

    expect(setDwFlags).toHaveBeenCalledTimes(1);
    expect(setDwFlags).toHaveBeenCalledWith(
      expect.objectContaining({
        meta: expect.objectContaining({
          equipment: expect.objectContaining({ tinyItems: "Item 1\nItem 2" })
        })
      })
    );
    expect(editable.textContent).toBe("Item 1\nItem 2");
  });

  it("normalizes non-breaking spaces for tiny items", async () => {
    document.body.innerHTML = `
      <div class="dw-equipment">
        <div
          class="dw-equipment__tiny-editable contenteditable"
          contenteditable="plaintext-only"
          data-field="tinyItems"
        ></div>
      </div>
    `;

    const html = $(document.body);
    const getDwFlags = vi.fn(buildDwFlags);
    const setDwFlags = vi.fn(async () => {});

    registerEquipmentListener(html, { getDwFlags, setDwFlags });

    const editable = html.find(".dw-equipment__tiny-editable").get(0) as HTMLElement;
    editable.innerText = "Rope\u00A0and\u00A0Torch";
    $(editable).trigger("blur");
    await flushPromises();

    expect(setDwFlags).toHaveBeenCalledTimes(1);
    expect(setDwFlags).toHaveBeenCalledWith(
      expect.objectContaining({
        meta: expect.objectContaining({
          equipment: expect.objectContaining({ tinyItems: "Rope and Torch" })
        })
      })
    );
    expect(editable.textContent).toBe("Rope and Torch");
  });
});
