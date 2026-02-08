import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "../../test/flushPromises.js";
import { registerKindredTraitsListener } from "./kindred-traits.listener.js";
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
      kindredClassTraits: "Old traits",
      background: "",
      alignment: "",
      affiliation: "",
      moonSign: "",
      languages: "",
      xp: 0,
      level: 1,
      nextLevel: 2000,
      modifier: 0
    }
  };
}

describe("registerKindredTraitsListener", () => {
  it("opens textarea on content click and saves by Enter", async () => {
    document.body.innerHTML = `
      <div class="dw-kindred-traits-display">
        <div class="dw-traits-content">Old traits</div>
      </div>
      <textarea class="dw-kindred-traits-textarea" style="display:none;"></textarea>
    `;
    const html = $(document.body);
    const getDwFlags = vi.fn(buildDwFlags);
    const setDwFlags = vi.fn(async () => {});

    registerKindredTraitsListener(html, { getDwFlags, setDwFlags });

    const content = html.find(".dw-traits-content");
    const textarea = html.find(".dw-kindred-traits-textarea");

    content.trigger("click");
    textarea.val("Updated traits");
    textarea.trigger($.Event("keydown", { key: "Enter", shiftKey: false }));
    await flushPromises();

    expect(setDwFlags).toHaveBeenCalledTimes(1);
    expect(setDwFlags).toHaveBeenCalledWith(
      expect.objectContaining({
        meta: expect.objectContaining({ kindredClassTraits: "Updated traits" })
      })
    );
    expect(content.text()).toBe("Updated traits");
  });
});



