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
        equippedWeight1: "",
        equippedWeight2: "",
        equippedWeight3: "",
        equippedWeight4: "",
        equippedWeight5: "",
        equippedWeight6: "",
        equippedWeight7: "",
        equippedWeight8: "",
        equippedWeight9: "",
        equippedWeight10: "",
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
        stowed16: "",
        stowedWeight1: "",
        stowedWeight2: "",
        stowedWeight3: "",
        stowedWeight4: "",
        stowedWeight5: "",
        stowedWeight6: "",
        stowedWeight7: "",
        stowedWeight8: "",
        stowedWeight9: "",
        stowedWeight10: "",
        stowedWeight11: "",
        stowedWeight12: "",
        stowedWeight13: "",
        stowedWeight14: "",
        stowedWeight15: "",
        stowedWeight16: ""
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

  it("updates equipment weight field on blur", async () => {
    document.body.innerHTML = `
      <div class="dw-equipment">
        <input class="edit-input" name="dw.meta.equipment.equippedWeight1" value="" />
      </div>
    `;

    const html = $(document.body);
    const getDwFlags = vi.fn(buildDwFlags);
    const setDwFlags = vi.fn(async () => {});

    registerEquipmentListener(html, { getDwFlags, setDwFlags });

    const input = html.find('input[name="dw.meta.equipment.equippedWeight1"]');

    input.val("40");
    input.trigger("blur");
    await flushPromises();

    expect(setDwFlags).toHaveBeenCalledTimes(1);
    expect(setDwFlags).toHaveBeenCalledWith(
      expect.objectContaining({
        meta: expect.objectContaining({
          equipment: expect.objectContaining({ equippedWeight1: "40" })
        })
      })
    );
  });

  it("updates total weight block when a weight field changes", async () => {
    document.body.innerHTML = `
      <div class="dw-equipment">
        <input class="edit-input" name="dw.meta.equipment.equippedWeight1" value="10" />
        <input class="edit-input" name="dw.meta.equipment.stowedWeight1" value="5" />
        <div data-total-weight>0</div>
      </div>
    `;

    const html = $(document.body);
    const getDwFlags = vi.fn(buildDwFlags);
    const setDwFlags = vi.fn(async () => {});

    registerEquipmentListener(html, { getDwFlags, setDwFlags });

    const total = html.find("[data-total-weight]");
    const input = html.find('input[name="dw.meta.equipment.stowedWeight1"]');

    expect(total.text()).toBe("15");

    input.val("8");
    input.trigger("change");
    await flushPromises();

    expect(total.text()).toBe("18");
  });
});
