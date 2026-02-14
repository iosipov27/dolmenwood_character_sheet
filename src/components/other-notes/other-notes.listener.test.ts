import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "../../test/flushPromises.js";
import { registerOtherNotesListener } from "./other-notes.listener.js";
import type { DwFlags } from "../../types.js";

function buildDwFlags(): DwFlags {
  return {
    saves: { doom: 1, hold: 1, spell: 1, ray: 1, blast: 1, magic: 1 },
    skills: { listen: 6, search: 6, survival: 6 },
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
        tinyItems: "",
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
      modifier: 0,
      coins: {
        copper: 1,
        silver: 2,
        gold: 3,
        pellucidium: 4
      },
      otherNotes: "Old note"
    }
  };
}

describe("registerOtherNotesListener", () => {
  it("saves coin value on change", async () => {
    document.body.innerHTML = `
      <input class="dw-other-notes__coin-input" name="dw.meta.coins.gold" value="3" />
    `;
    const html = $(document.body);
    const getDwFlags = vi.fn(buildDwFlags);
    const setDwFlags = vi.fn(async () => {});

    registerOtherNotesListener(html, { getDwFlags, setDwFlags });

    const goldInput = html.find('input[name="dw.meta.coins.gold"]');

    goldInput.val("15");
    goldInput.trigger("change");
    await flushPromises();

    expect(setDwFlags).toHaveBeenCalledTimes(1);
    expect(setDwFlags).toHaveBeenCalledWith(
      expect.objectContaining({
        meta: expect.objectContaining({
          coins: expect.objectContaining({ gold: 15 })
        })
      })
    );
  });

  it("normalizes invalid coin values to 0", async () => {
    document.body.innerHTML = `
      <input class="dw-other-notes__coin-input" name="dw.meta.coins.silver" value="2" />
    `;
    const html = $(document.body);
    const getDwFlags = vi.fn(buildDwFlags);
    const setDwFlags = vi.fn(async () => {});

    registerOtherNotesListener(html, { getDwFlags, setDwFlags });

    const silverInput = html.find('input[name="dw.meta.coins.silver"]');

    silverInput.val("-5");
    silverInput.trigger("blur");
    await flushPromises();

    expect(setDwFlags).toHaveBeenCalledTimes(1);
    expect(setDwFlags).toHaveBeenCalledWith(
      expect.objectContaining({
        meta: expect.objectContaining({
          coins: expect.objectContaining({ silver: 0 })
        })
      })
    );
  });
});
